import { ScoreType } from "@/app/ui/dashboard/pong-game";
import { INTERVAL, types } from "../globals";
import type { InputType, StartType } from "../types";
import { Identity } from "./Identity.class";

const UPKEYS = ["ArrowUp", "w", "W"]; 
const DOWNKEYS = ["ArrowDown", "s", "S"];

type PowerUpState = {
	id: number;
	type: string;
	color: string;
	position: {x: number; y: number;};
	radius: number;
} | null;

type EffectState = {
	id: number;
	type: string;
	targetSlot: 1 | 2;
	color: string;
	remainingMs: number;
}
type PendingInput = {
	seq: number;
	up: boolean;
	down: boolean;
	sentAt: number;
};
type SnapshotPlayerState = {
	id: string;
	name: string;
	score: number;
	position: {x: number; y: number;};
	size: {width: number; height: number;};
	connected: boolean;
	lastInputSeq?: number;
};
type SnapshotState = {
	timestamp: number;
	players: Record<1 | 2, SnapshotPlayerState>;
	ball: {exists: boolean; position?: {x: number; y: number;};};
	game: {started: boolean; ended: boolean; time: string;};
	powerUp: PowerUpState;
	effects: EffectState[];
};

export class State {
	private identity = new Identity();
	private setScore: ((score: ScoreType) => void) | null = null;
	private lastScoreSignature = "";
	private ball = {vector: {x: 0, y: 0}, exist: false};
	private powerUp: PowerUpState = null;
	private effects: EffectState[] = [];
	private players: Record<1 | 2, {
		id: string;
		name: string;
		score: number;
		pos: {x: number; y: number;};
		size: {width: number; height: number;};
		connected: boolean
	}> = {
		1: {id: '', name: "", score: 0, pos: {x: 0, y: 0}, size: {width: 20, height: 100}, connected: false},
		2: {id: '', name: "", score: 0, pos: {x: 0, y: 0}, size: {width: 20, height: 100}, connected: false},
	};
	private latency = {
		ping: null as ReturnType<typeof setInterval> | null,
		lastPingTimestamp: 0,
		delay: INTERVAL,
		ms: 0,
	};
	private game = {
		gameStarted: false,
		gameEnd: false,
		allOk: false,
		timer: "00:00",
	}
	private keysBound: boolean = false;
	private inputSeq = 0;
	private lastServerAckSeq = 0;
	private pendingInputs: PendingInput[] = [];
	private readonly interpolationDelayMs = 120;
	private serverClockOffsetMs = 0;
	private clockSynced = false;
	private snapshots: SnapshotState[] = [];
	private keys: InputType = {
		id: 0,
		matchId: 0,
		type: types.INPUT,
		seq: 0,
		up: false,
		down: false
	}
	private resetMatchState() {
		this.ball = {vector: {x: 0, y: 0}, exist: false};
		this.powerUp = null;
		this.effects = [];
		this.players = {
			1: {id: '', name: "", score: 0, pos: {x: 0, y: 0}, size: {width: 20, height: 100}, connected: false},
			2: {id: '', name: "", score: 0, pos: {x: 0, y: 0}, size: {width: 20, height: 100}, connected: false},
		};
		this.game = {
			gameStarted: false,
			gameEnd: false,
			allOk: false,
			timer: "00:00",
		};
		this.keys.up = false;
		this.keys.down = false;
		this.keys.seq = 0;
		this.inputSeq = 0;
		this.lastServerAckSeq = 0;
		this.pendingInputs = [];
		this.serverClockOffsetMs = 0;
		this.clockSynced = false;
		this.snapshots = [];
	}

	public getPing() {
		return this.latency.ms;
	}

	//Identity methods
	public setIdentity(data: StartType) {
		this.identity.reset();
		this.identity.setInfo(data);
		this.lastScoreSignature = "";
		this.resetMatchState();
	}
	public getIdentity() {
		return this.identity.getInfo();
	}
	public setId(id: 1 | 2) {
		this.identity.setId(id);
	}

	public setSetScore(callback: (score: ScoreType) => void) {
		this.setScore = callback;
		this.emitScoreIfChanged(true);
	}

		public setConnection(me:boolean) {
			const id: 1 | 2 | 0 = this.identity.getInfo().id;

			if (id) {
				this.players[id].connected = me;
				this.game.allOk = [
					this.game.gameStarted,
					!this.game.gameEnd,
					this.players[1].connected,
					this.players[2].connected,
				].every(Boolean);
			}
		}
	public setPlayer({id, user_id, name, score, pos, size, connected, lastInputSeq}: {
		id: 1 | 2;
		user_id: string;
		name: string;
		score: number;
		pos: {x: number; y: number;};
		size: {width: number; height: number;};
		connected: boolean;
		lastInputSeq?: number;
	}) {
		this.players[id] = {
			id: user_id,
			name,
			score,
			pos,
			size,
			connected,
		}
		const localSlot = this.identity.getInfo().id;
		if (localSlot === id) {
			const ackSeq = Number(lastInputSeq);
			if (Number.isFinite(ackSeq)) this.acknowledgeInput(Math.floor(ackSeq));
		}
	}
	public getPlayers() {
		return this.players;
	}

	public setBall({exist, vector}: {exist: boolean; vector?: {x: number; y: number;};}) {
		this.ball.exist = exist;
		// console.log(`ball Stats set to exist: ${exist} vector: ${vector ? `x: ${vector.x}, y: ${vector.y}` : "undefined"}`);
		if (vector) {
			this.ball.vector = vector;
			// console.log(`Ball position set to x: ${vector.x}, y: ${vector.y}`);
		}
	}
	public getBall() {
		return {...this.ball};
	}

	public setPowerUp(powerUp: PowerUpState) {
		if (!powerUp) {
			this.powerUp = null;
			return;
		}

		this.powerUp = {
			id: powerUp.id,
			type: powerUp.type,
			color: powerUp.color,
			position: {x: powerUp.position.x, y: powerUp.position.y},
			radius: powerUp.radius,
		};
	}
	public getPowerUp() {
		if (!this.powerUp) return null;
		return {
			...this.powerUp,
			position: {...this.powerUp.position},
		};
	}

	public setEffects(effects: EffectState[]) {
		if (!Array.isArray(effects)) {
			this.effects = [];
			return;
		}

		this.effects = effects
			.filter((effect) =>
				effect
				&& typeof effect.id === "number"
				&& (effect.targetSlot === 1 || effect.targetSlot === 2)
				&& typeof effect.type === "string"
				&& typeof effect.color === "string"
			)
			.map((effect) => ({
				id: effect.id,
				type: effect.type,
				targetSlot: effect.targetSlot,
				color: effect.color,
				remainingMs: Math.max(0, Number(effect.remainingMs) || 0),
			}));
	}
	public getEffects() {
		return this.effects.map((effect) => ({...effect}));
	}
	public getEffectsForPlayer(slot: 1 | 2) {
		return this.effects.filter((effect) => effect.targetSlot === slot);
	}

	//Last setter to be called after all others
	public setGame({gameStarted, gameEnd, timer}: {
		gameStarted: boolean;
		gameEnd: boolean;
		timer: string;
	}) {
		this.game.gameStarted = gameStarted;
		this.game.gameEnd = gameEnd;
		this.game.timer = timer;

		this.game.allOk = [
			this.game.gameStarted,
			!this.game.gameEnd,
			this.players[1].connected,
			this.players[2].connected,
		].every(Boolean);

		this.emitScoreIfChanged();
	}
	public getGame() {
		return {...this.game};
	}
	public pushSnapshot({
		timestamp,
		players,
		ball,
		game,
		powerUp,
		effects,
	}: {
		timestamp?: number;
		players: Record<string, SnapshotPlayerState>;
		ball: {exists: boolean; position?: {x: number; y: number;}};
		game: {started: boolean; ended: boolean; time: string;};
		powerUp: PowerUpState;
		effects: EffectState[];
	}) {
		const normalizedPlayers: Record<1 | 2, SnapshotPlayerState> = {
			1: {
				id: players["1"]?.id ?? "",
				name: players["1"]?.name ?? "",
				score: Number(players["1"]?.score) || 0,
				position: {
					x: Number(players["1"]?.position?.x) || 0,
					y: Number(players["1"]?.position?.y) || 0,
				},
				size: {
					width: Number(players["1"]?.size?.width) || 20,
					height: Number(players["1"]?.size?.height) || 100,
				},
				connected: Boolean(players["1"]?.connected),
				lastInputSeq: Number(players["1"]?.lastInputSeq),
			},
			2: {
				id: players["2"]?.id ?? "",
				name: players["2"]?.name ?? "",
				score: Number(players["2"]?.score) || 0,
				position: {
					x: Number(players["2"]?.position?.x) || 0,
					y: Number(players["2"]?.position?.y) || 0,
				},
				size: {
					width: Number(players["2"]?.size?.width) || 20,
					height: Number(players["2"]?.size?.height) || 100,
				},
				connected: Boolean(players["2"]?.connected),
				lastInputSeq: Number(players["2"]?.lastInputSeq),
			},
		};
		const snapshot: SnapshotState = {
			timestamp: this.getSnapshotTimestamp(timestamp),
			players: normalizedPlayers,
			ball: {
				exists: Boolean(ball?.exists),
				position: ball?.position
					? {x: Number(ball.position.x) || 0, y: Number(ball.position.y) || 0}
					: undefined,
			},
			game: {
				started: Boolean(game?.started),
				ended: Boolean(game?.ended),
				time: game?.time ?? "00:00",
			},
			powerUp: powerUp ?? null,
			effects: Array.isArray(effects) ? effects : [],
		};

		this.snapshots.push(snapshot);
		if (this.snapshots.length > 120) this.snapshots.shift();

		if (!this.game.gameStarted || this.snapshots.length < 2) {
			this.applySnapshot(snapshot);
		}
	}
	public tickNetworkInterpolation(nowEpoch = this.nowEpochMs()) {
		if (!this.snapshots.length) return;

		const renderTime = this.estimateServerNow(nowEpoch) - this.interpolationDelayMs;
		while (
			this.snapshots.length >= 2 &&
			this.snapshots[1].timestamp <= renderTime
		) {
			this.snapshots.shift();
		}

		if (this.snapshots.length < 2) {
			this.applySnapshot(this.snapshots[0]);
			return;
		}

		const prev = this.snapshots[0];
		const next = this.snapshots[1];
		const span = Math.max(1, next.timestamp - prev.timestamp);
		const alpha = Math.max(0, Math.min(1, (renderTime - prev.timestamp) / span));
		this.applyInterpolatedSnapshot(prev, next, alpha);
	}
	private applySnapshot(snapshot: SnapshotState) {
		for (const slot of [1, 2] as const) {
			const player = snapshot.players[slot];
			this.setPlayer({
				id: slot,
				user_id: player.id,
				name: player.name,
				score: player.score,
				pos: {x: player.position.x, y: player.position.y},
				size: {width: player.size.width, height: player.size.height},
				connected: player.connected,
				lastInputSeq: player.lastInputSeq,
			});
		}

		this.setBall({
			exist: snapshot.ball.exists,
			vector: snapshot.ball.position
				? {x: snapshot.ball.position.x, y: snapshot.ball.position.y}
				: undefined,
		});
		this.setGame({
			gameStarted: snapshot.game.started,
			gameEnd: snapshot.game.ended,
			timer: snapshot.game.time,
		});
		this.setPowerUp(snapshot.powerUp);
		this.setEffects(snapshot.effects);
	}
	private applyInterpolatedSnapshot(prev: SnapshotState, next: SnapshotState, alpha: number) {
		for (const slot of [1, 2] as const) {
			const a = prev.players[slot];
			const b = next.players[slot];
			this.setPlayer({
				id: slot,
				user_id: b.id,
				name: b.name,
				score: b.score,
				pos: {
					x: this.lerp(a.position.x, b.position.x, alpha),
					y: this.lerp(a.position.y, b.position.y, alpha),
				},
				size: {width: b.size.width, height: b.size.height},
				connected: b.connected,
				lastInputSeq: b.lastInputSeq,
			});
		}

		if (prev.ball.exists && next.ball.exists && prev.ball.position && next.ball.position) {
			this.setBall({
				exist: true,
				vector: {
					x: this.lerp(prev.ball.position.x, next.ball.position.x, alpha),
					y: this.lerp(prev.ball.position.y, next.ball.position.y, alpha),
				},
			});
		} else {
			this.setBall({
				exist: next.ball.exists,
				vector: next.ball.position
					? {x: next.ball.position.x, y: next.ball.position.y}
					: undefined,
			});
		}
		this.setGame({
			gameStarted: next.game.started,
			gameEnd: next.game.ended,
			timer: next.game.time,
		});
		this.setPowerUp(next.powerUp);
		this.setEffects(next.effects);
	}
	private lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	//Latency methods
	public getLatency(sendCallback: (data: any) => void) {
		if (this.latency.ping) return;

		this.latency.ping = setInterval(() => {
			this.latency.lastPingTimestamp = Date.now();
			const id = this.identity.getInfo();

			sendCallback({
				type: types.PING,
				id: id.id,
				matchId: id.matchId,
			});
;		}, this.latency.delay);
	}
	public setLatency() {
		this.latency.ms = Date.now() - this.latency.lastPingTimestamp;
		console.log(`Latency: ${this.latency.ms} ms`);
	}
	public stopGettingLatency() {
		if (this.latency.ping) {
			clearInterval(this.latency.ping);
			this.latency.ping = null;
		}
	}

	//Keys handler
	private handleKey(event: KeyboardEvent, sendCallback: (data: any) => void, isPressed: boolean = true): void {

		let up: boolean = UPKEYS.includes(event.key);
		let down: boolean = DOWNKEYS.includes(event.key);
		let changed: boolean = false;

		if (!isPressed) {
			up = !up && this.keys.up;
			down = !down && this.keys.down;
		}

		changed = this.keys.up !== up || this.keys.down !== down;
		this.keys.up = this.keys.up !== up ? up : this.keys.up;
		this.keys.down = this.keys.down !== down ? down : this.keys.down;

		if (changed) {
			const identity = this.getIdentity();
			if (!identity.id || !identity.matchId) return;

			this.keys.id = identity.id;
			this.keys.matchId = identity.matchId;
			this.keys.seq = this.registerInput(this.keys.up, this.keys.down);
			sendCallback(this.keys);
		}
	}
	public checkKeys(sendCallback: (data:any) => void):void {
		if (this.keysBound) return;
		this.keysBound = true;

		window.addEventListener("keydown", (event) => {
			this.handleKey(event, sendCallback);
		});
		window.addEventListener("keyup", (event) => {
			this.handleKey(event, sendCallback, false);
		});
	}
	public getInputDirection() {
		return {
			up: this.keys.up,
			down: this.keys.down,
		};
	}
	public getReconciledLocalY(
		slot: 1 | 2,
		baseY: number,
		speedPxPerSec: number,
		speedMultiplier: number,
		now = this.nowMs()
	) {
		if (this.identity.getInfo().id !== slot) return baseY;
		if (!this.pendingInputs.length) return baseY;

		let predictedY = baseY;
		for (let i = 0; i < this.pendingInputs.length; i++) {
			const current = this.pendingInputs[i];
			const next = this.pendingInputs[i + 1];
			const endAt = next ? next.sentAt : now;
			const dtSeconds = Math.max(0, endAt - current.sentAt) / 1000;
			const dir = Number(current.down) - Number(current.up);
			predictedY += dir * speedPxPerSec * speedMultiplier * dtSeconds;
		}

		return predictedY;
	}
	private registerInput(up: boolean, down: boolean) {
		this.inputSeq += 1;
		this.pendingInputs.push({
			seq: this.inputSeq,
			up,
			down,
			sentAt: this.nowMs(),
		});
		if (this.pendingInputs.length > 120) {
			this.pendingInputs = this.pendingInputs.slice(-120);
		}
		return this.inputSeq;
	}
	private acknowledgeInput(serverSeq: number) {
		if (!Number.isFinite(serverSeq)) return;
		if (serverSeq <= this.lastServerAckSeq) return;

		this.lastServerAckSeq = serverSeq;
		this.pendingInputs = this.pendingInputs.filter((entry) => entry.seq > serverSeq);
	}
	private getSnapshotTimestamp(rawTimestamp?: number) {
		const clientEpochNow = this.nowEpochMs();
		const parsedTimestamp = Number(rawTimestamp);
		const hasServerTimestamp = Number.isFinite(parsedTimestamp) && parsedTimestamp > 0;
		if (hasServerTimestamp) {
			this.syncServerClock(parsedTimestamp, clientEpochNow);
		}

		let timestamp = hasServerTimestamp
			? Math.floor(parsedTimestamp)
			: Math.floor(this.estimateServerNow(clientEpochNow));
		const latestSnapshot = this.snapshots[this.snapshots.length - 1];
		if (latestSnapshot && timestamp <= latestSnapshot.timestamp) {
			timestamp = latestSnapshot.timestamp + 1;
		}

		return timestamp;
	}
	private syncServerClock(serverTimestamp: number, clientEpochNow: number) {
		const observedOffset = serverTimestamp - clientEpochNow;
		if (!this.clockSynced) {
			this.serverClockOffsetMs = observedOffset;
			this.clockSynced = true;
			return;
		}

		const smoothing = observedOffset > this.serverClockOffsetMs ? 0.25 : 0.02;
		this.serverClockOffsetMs = this.lerp(
			this.serverClockOffsetMs,
			observedOffset,
			smoothing
		);
	}
	private estimateServerNow(clientEpochNow = this.nowEpochMs()) {
		if (!this.clockSynced) return clientEpochNow;
		return clientEpochNow + this.serverClockOffsetMs;
	}
	private nowMs() {
		return typeof performance !== "undefined" ? performance.now() : Date.now();
	}
	private nowEpochMs() {
		return Date.now();
	}

	private emitScoreIfChanged(force = false) {
		if (!this.setScore) return;

		const p1 = this.players[1];
		const p2 = this.players[2];
		const signature = `${this.game.timer}|${p1.id}|${p1.name}|${p1.score}|${p2.id}|${p2.name}|${p2.score}`;
		if (!force && signature === this.lastScoreSignature) return;

		this.lastScoreSignature = signature;
		this.setScore({
			timer: this.game.timer,
			players: [
				{
					name: p1.name,
					id: p1.id,
					score: p1.score,
				},
				{
					name: p2.name,
					id: p2.id,
					score: p2.score,
				},
			],
		});
	}
}
