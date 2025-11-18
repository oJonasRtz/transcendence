import { INTERVAL, types } from "../globals";
import type { InputType, StartType } from "../types";
import { Identity } from "./Identity.class";

const UPKEYS = ["ArrowUp", "w", "W"]; 
const DOWNKEYS = ["ArrowDown", "s", "S"];

export class State {
	private identity = new Identity();
	private ball = {vector: {x: 0, y: 0}, exist: false};
	private players: Record<1 | 2, {
		name: string;
		score: number;
		direction: {up: boolean; down: boolean;};
		connected: boolean
	}> = {
		1: {name: "", score: 0, direction: {up: false, down: false}, connected: false},
		2: {name: "", score: 0, direction: {up: false, down: false}, connected: false},
	};
	private latency = {
		ping: 0,
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
	private keys: InputType = {
		id: 0,
		matchId: 0,
		type: types.INPUT,
		up: false,
		down: false
	}

	//Identity methods
	public setIdentity(data: StartType) {
		this.identity.setInfo(data);
	}
	public getIdentity() {
		return this.identity.getInfo();
	}
	public setId(id: 1 | 2) {
		this.identity.setId(id);
	}

	public setConnection(me:boolean) {
		const id: 1 | 2 | 0 = this.identity.getInfo().id;

		if (id)
			this.players[id].connected = me;
	}
	public setPlayer({id, name, score, direction, connected}: {
		id: 1 | 2;
		name: string;
		score: number;
		direction: {up: boolean; down: boolean;};
		connected: boolean;
	}) {
		this.players[id] = {
			name,
			score,
			direction,
			connected,
		}
	}
	public getPlayers() {
		return this.players;
	}

	public setBall({exist, vector}: {exist: boolean; vector?: {x: number; y: number;};}) {
		this.ball.exist = exist;
		console.log(`ball Stats set to exist: ${exist} vector: ${vector ? `x: ${vector.x}, y: ${vector.y}` : "undefined"}`);
		if (vector) {
			this.ball.vector = vector;
			console.log(`Ball position set to x: ${vector.x}, y: ${vector.y}`);
		}
	}
	public getBall() {
		return {...this.ball};
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
	}
	public getGame() {
		return {...this.game};
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
	}
	public stopGettingLatency() {
		if (this.latency.ping) {
			clearInterval(this.latency.ping);
			this.latency.ping = 0;
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
			this.keys.id = this.getIdentity().id;
			this.keys.matchId = this.getIdentity().matchId;
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
}
