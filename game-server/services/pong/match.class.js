import { createId } from "../../controllers/createId.js";
import { Player } from "./player.class.js";
import {
  DISCONNECT_TIMEOUT,
  INTERVALS,
  lobby,
  matches,
  RIGHT,
  stats,
  types,
} from "../../server.shared.js";
import { Ball } from "./Ball.class.js";

const POWER_UPS = [
  "GIANT_PADDLE",
  "QUICK_FEET",
  "FROZEN_RIVAL",
  "HYPER_BALL",
];

const POWER_COLORS = {
  GIANT_PADDLE: "#7c3aed",
  QUICK_FEET: "#06b6d4",
  FROZEN_RIVAL: "#ef4444",
  HYPER_BALL: "#f59e0b",
};
const DEFAULT_NETWORK_TICK_FPS = 30;
const parsedNetworkTickFps = Number(process.env.NETWORK_TICK_FPS);
const NETWORK_TICK_FPS =
  Number.isFinite(parsedNetworkTickFps) && parsedNetworkTickFps > 0
    ? Math.max(10, Math.min(60, Math.floor(parsedNetworkTickFps)))
    : DEFAULT_NETWORK_TICK_FPS;
const DEFAULT_SIMULATION_FPS = 60;
const parsedSimulationFps = Number(process.env.SIMULATION_FPS);
const SIMULATION_FPS =
  Number.isFinite(parsedSimulationFps) && parsedSimulationFps > 0
    ? Math.max(30, Math.min(120, Math.floor(parsedSimulationFps)))
    : DEFAULT_SIMULATION_FPS;

export class Match {
  #allConnected = false;
  #players = {};
  #id = 0;
  #matchStarted = null;
  #gameStarted = false;
  #matchDuration = 0;
  #timer = null;
  #maxPlayers = 2;
  #maxScore = stats?.maxScore ?? 11;
  #gameEnded = false;
  #timeout = null;
  #timeFormated = "00:00";
  #ball = null;
  #lastScorer = null;
  #mainLoopInterval = null;
  #lastSimulationAt = 0;
  #lastNetworkBroadcastAt = 0;
  #lastBallTouchSlot = 1;
  #powerUp = null;
  #nextPowerUpAt = Date.now() + 5000;
  #powerUpIndex = 0;
  #effectIndex = 0;
  #activeEffects = [];
  #readyPlayers = new Set();
  #onScoreHandler = this.#onScore.bind(this);
  #bounceHandler = this.#bounce.bind(this);

  #areAllConnectedPlayersReady() {
    const connectedSlots = Object.entries(this.#players)
      .filter(([, player]) => player?.connected)
      .map(([slot]) => Number(slot));
    return (
      connectedSlots.length === this.#maxPlayers &&
      connectedSlots.every((slot) => this.#readyPlayers.has(slot))
    );
  }

  constructor({ players, maxPlayers }) {
    try {
      if (!players || Object.keys(players).length < 2)
        throw new Error(types.error.PLAYER_MISSING);

      this.#id = createId(players[1].id, players[2].id);
      this.#maxPlayers = maxPlayers || this.#maxPlayers;
      Object.values(players).forEach((p, i) => {
        const index = i + 1;
        this.#players[index] = new Player(p, { index, matchId: this.#id });
      });

      this.#inactivityDisconnect(2);
    } catch (error) {
      if (error.name === "TypeError") throw new Error(types.error.TYPE_ERROR);

      throw error;
    }
  }
  get id() {
    return this.#id;
  }

  get allconnected() {
    return this.#allConnected;
  }

  get gameStarted() {
    return this.#gameStarted;
  }

  get gameEnded() {
    return this.#gameEnded;
  }

  get connectedPlayersCount() {
    return Object.values(this.#players).reduce(
      (total, player) => total + Number(Boolean(player?.connected)),
      0
    );
  }
  // --- Match Timer Methods ---
  #getTime(timestamp) {
    const date = new Date(timestamp);
    const dateBR = new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
    const day = String(dateBR.getDate()).padStart(2, "0");
    const month = String(dateBR.getMonth() + 1).padStart(2, "0");
    const year = dateBR.getFullYear();
  
    const hour = String(dateBR.getHours()).padStart(2, "0");
    const minute = String(dateBR.getMinutes()).padStart(2, "0");
    const second = String(dateBR.getSeconds()).padStart(2, "0");
  
    return { day, month, year, hour, minute, second };
  }
  #startTimer() {
    if (!this.#matchStarted || this.#timer) return;

    this.#timer = setInterval(() => {
      this.#matchDuration = Date.now() - this.#matchStarted;

      const { minute, second } = this.#getTime(this.#matchDuration);
      const formatted = `${minute}:${second.toString().padStart(2, "0")}`;

      this.#timeFormated = formatted;
    }, INTERVALS);
  }
  #stopTimer() {
    if (!this.#timer) return;
    clearInterval(this.#timer);
    this.#timer = null;
  }

  // --- Utils ---
  #broadcast(message, wsToSkip = null) {
    if (!this.#allConnected) return;

    for (const p of Object.values(this.#players))
      if (!p.checkWs(wsToSkip)) {
        p.send(message);
      }
  }
  #broadcastSerialized(serializedMessage, wsToSkip = null) {
    if (!this.#allConnected) return;

    for (const p of Object.values(this.#players))
      if (!p.checkWs(wsToSkip)) {
        p.sendSerialized(serializedMessage);
      }
  }
  #inactivityDisconnect(minutes = 1) {
    const timeout = DISCONNECT_TIMEOUT * minutes;

    if (!this.#timeout) {
      this.#timeout = setTimeout(() => {
        console.log(`Match ${this.#id} removed due to inactivity`);
        lobby.removeMatch(this.#id, true, true);
        lobby.send({ type: types.message.TIMEOUT_REMOVE, matchId: this.#id });
      }, timeout);
    }
  }
  #getOpponentSlot(slot) {
    const numeric = Number(slot);
    return numeric === 1 ? 2 : 1;
  }
  #scheduleNextPowerUp(now = Date.now()) {
    const minDelay = 3500;
    const maxDelay = 7000;
    this.#nextPowerUpAt =
      now + minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
  }
  #spawnPowerUp(now = Date.now()) {
    const mapWidth = stats?.map?.width ?? 800;
    const mapHeight = stats?.map?.height ?? 600;
    const marginX = Math.min(150, mapWidth * 0.2);
    const marginY = Math.min(120, mapHeight * 0.2);
    const type = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];

    this.#powerUp = {
      id: ++this.#powerUpIndex,
      type,
      color: POWER_COLORS[type] ?? "#ffffff",
      radius: 16,
      x: Math.floor(
        marginX + Math.random() * Math.max(1, mapWidth - marginX * 2)
      ),
      y: Math.floor(
        marginY + Math.random() * Math.max(1, mapHeight - marginY * 2)
      ),
      spawnedAt: now,
    };
    this.#scheduleNextPowerUp(now);
    console.log(
      `Power-up ${this.#powerUp.type} spawned in match ${this.#id} at (${this.#powerUp.x}, ${this.#powerUp.y})`
    );
  }
  #removeExpiredEffects(now = Date.now()) {
    this.#activeEffects = this.#activeEffects.filter(
      (effect) => effect.expiresAt > now
    );
  }
  #registerEffect({ type, targetSlot, durationMs, color }) {
    const now = Date.now();
    this.#activeEffects.push({
      id: ++this.#effectIndex,
      type,
      targetSlot,
      color: color ?? POWER_COLORS[type] ?? "#ffffff",
      startedAt: now,
      durationMs,
      expiresAt: now + durationMs,
    });
  }
  #applyPowerUp(type, collectorSlot) {
    const collector = this.#players[collectorSlot];
    const opponent = this.#players[this.#getOpponentSlot(collectorSlot)];
    if (!collector || !opponent) return;

    switch (type) {
      case "GIANT_PADDLE":
        collector.applyHeightMultiplier(1.5, 8000);
        this.#registerEffect({
          type,
          targetSlot: collectorSlot,
          durationMs: 8000,
        });
        break;
      case "QUICK_FEET":
        collector.applySpeedMultiplier(1.35, 7000);
        this.#registerEffect({
          type,
          targetSlot: collectorSlot,
          durationMs: 7000,
        });
        break;
      case "FROZEN_RIVAL":
        opponent.applySpeedMultiplier(0.68, 6000);
        this.#registerEffect({
          type,
          targetSlot: this.#getOpponentSlot(collectorSlot),
          durationMs: 6000,
        });
        break;
      case "HYPER_BALL":
        if (this.#ball) {
          this.#ball.applySpeedMultiplier(1.28, 6000);
        }
        this.#registerEffect({
          type,
          targetSlot: collectorSlot,
          durationMs: 6000,
        });
        break;
      default:
        break;
    }
  }
  #checkPowerUpCollision(now = Date.now()) {
    if (!this.#powerUp || !this.#ball) return;

    const ballPos = this.#ball.position;
    const radius = (this.#ball.radius ?? 10) + this.#powerUp.radius;
    const dx = ballPos.x - this.#powerUp.x;
    const dy = ballPos.y - this.#powerUp.y;
    const touching = dx * dx + dy * dy <= radius * radius;

    if (!touching) return;

    const fallback = this.#ball.direction.x >= 0 ? 1 : 2;
    const collectorSlot = this.#players[this.#lastBallTouchSlot]
      ? this.#lastBallTouchSlot
      : fallback;
    const takenType = this.#powerUp.type;

    this.#powerUp = null;
    this.#applyPowerUp(takenType, collectorSlot);
    this.#scheduleNextPowerUp(now);
    console.log(
      `Player slot ${collectorSlot} collected power-up ${takenType} in match ${this.#id}`
    );
  }
  #updatePowerUps(now = Date.now()) {
    if (!this.#gameStarted || this.#gameEnded || !this.#allConnected) return;

    this.#removeExpiredEffects(now);

    if (!this.#powerUp && this.#ball && now >= this.#nextPowerUpAt) {
      this.#spawnPowerUp(now);
    }
    this.#checkPowerUpCollision(now);
  }
  #setPlayerReady(id) {
    const slot = Number(id);
    const player = this.#players[slot];

    if (!player || !player.connected) return;
    if (this.#readyPlayers.has(slot)) return;

    this.#readyPlayers.add(slot);
    console.log(
      `Player ${slot} ready in match ${this.#id} (${this.#readyPlayers.size}/${this.#maxPlayers})`
    );
    this.#tryStartGame();
  }
  #tryStartGame() {
    if (!this.#allConnected || this.#gameStarted || this.#gameEnded) return;

    if (!this.#areAllConnectedPlayersReady()) return;

    this.#matchStarted = Date.now();
    this.#gameStarted = true;
    this.#scheduleNextPowerUp(this.#matchStarted);
    this.#newBall();
    this.#startTimer();
    // console.log(`Match ${this.#id} started after both players were ready.`);
  }

  // --- Player Connection ---
  connectPlayer(playerId, ws, name) {
    let slot = 0;
    let connected = false;
    for (const [key, p] of Object.entries(this.#players)) {
      try {
        p.connect(ws, playerId, name);
        p.send({
          type: types.message.CONNECT_PLAYER,
          id: key,
          matchId: this.#id,
        });
        // console.log(`Player ${key} connected to match ${this.#id}`);
        slot = Number(key);
        connected = true;
        break;
      } catch (error) {
        console.error("Error connecting player:", error.message);
      }
    }
    if (!connected) throw new Error(types.error.NOT_FOUND);
    this.#readyPlayers.delete(Number(slot));

    // Check if all players are connected to start the game
    if (Object.values(this.#players).every((p) => p.connected)) {
      this.#allConnected = true;

      // Clear inactivity timeout
      if (this.#timeout) {
        clearTimeout(this.#timeout);
        this.#timeout = null;
      }
      console.log(
        `All players connected for match ${this.#id}. Waiting both players to load/ready...`
      );
      this.#inactivityDisconnect(2);
      this.#tryStartGame();
      this.#startMainLoop();
    }

    // this.#broadcast({type: types.message.OPPONENT_CONNECTED, connected: true}, ws);
    return { matchIndex: this.#id, id: slot };
  }
  disconnectPlayer(slot) {
    const player = this.#players[slot];
    if (!player) return;

    player.destroy();
    this.#allConnected = false;
    this.#readyPlayers.delete(Number(slot));
    // this.#broadcast({type: types.message.OPPONENT_DISCONNECTED, connected: false});

    if (
      this.#gameStarted &&
      !this.#gameEnded &&
      Object.values(this.#players).every((p) => !p.connected)
    )
      this.#inactivityDisconnect(2);
  }

  // --- Main Loop ---
  #startMainLoop() {
    if (this.#mainLoopInterval) return;

    this.#lastSimulationAt = Date.now();
    this.#lastNetworkBroadcastAt = 0;
    this.#mainLoopInterval = setInterval(() => {
      const now = Date.now();
      const rawDelta = (now - this.#lastSimulationAt) / 1000;
      const deltaSeconds = Math.min(Math.max(rawDelta, 0), 0.05);
      this.#lastSimulationAt = now;

      this.#stepSimulation(deltaSeconds, now);
      this.#broadcastOnCadence(now);

      if (this.#gameEnded && !this.#allConnected) lobby.removeMatch(this.#id);
    }, INTERVALS / SIMULATION_FPS);
  }
  #stepSimulation(deltaSeconds, now = Date.now()) {
    if (!this.#allConnected || !this.#gameStarted || this.#gameEnded) return;
    if (!this.#areAllConnectedPlayersReady()) return;

    for (const player of Object.values(this.#players)) {
      player.update(deltaSeconds);
    }
    if (this.#ball) {
      this.#ball.update(deltaSeconds, this.#onScoreHandler, this.#bounceHandler);
    }
    this.#updatePowerUps(now);
  }
  #broadcastOnCadence(now = Date.now()) {
    if (!this.#allConnected) return;

    const snapshotIntervalMs = INTERVALS / NETWORK_TICK_FPS;
    if (
      !this.#lastNetworkBroadcastAt ||
      now - this.#lastNetworkBroadcastAt >= snapshotIntervalMs
    ) {
      this.#lastNetworkBroadcastAt = now;
      this.#broadcastState(now);
    }
  }
  #broadcastState(now = Date.now()) {
    const players = Object.keys(this.#players).reduce((acc, id) => {
      acc[id] = {
        ...this.#players[id].info,
      };
      return acc;
    }, {});
    const ball = this.#ball
      ? {
          exists: true,
          position: { ...this.#ball.position },
        }
      : { exists: false };
    const game = {
      started: this.#gameStarted,
      ended: this.#gameEnded,
      time: this.#timeFormated,
    };
    const powerUp = this.#powerUp
      ? {
          id: this.#powerUp.id,
          type: this.#powerUp.type,
          color: this.#powerUp.color,
          position: { x: this.#powerUp.x, y: this.#powerUp.y },
          radius: this.#powerUp.radius,
        }
      : null;
    const effects = this.#activeEffects.map((effect) => ({
      id: effect.id,
      type: effect.type,
      targetSlot: effect.targetSlot,
      color: effect.color,
      remainingMs: Math.max(0, effect.expiresAt - now),
    }));
    const message = {
      type: types.message.PING,
      timestamp: now,
      players,
      ball,
      game,
      powerUp,
      effects,
    };
    const serializedMessage = JSON.stringify(message);
    this.#broadcastSerialized(serializedMessage);
  }
  #stopMainLoop() {
    if (!this.#mainLoopInterval) return;
    clearInterval(this.#mainLoopInterval);
    this.#mainLoopInterval = null;
    this.#lastSimulationAt = 0;
    this.#lastNetworkBroadcastAt = 0;
  }
  pong(id) {
    const p = this.#players[id];

    if (p) p.send({ type: "PONG" });
  }

  // --- Manage Game State ---
  endGame(winner) {
    if (this.#gameEnded) return;

    this.#gameEnded = true;
    this.#stopTimer();

    const stats = {
      type: types.message.END_GAME,
      matchId: this.#id,
      players: Object.fromEntries(
        Array.from({ length: this.#maxPlayers }, (_, i) => {
          const p = i + 1;
          const player = this.#players[p].info;

          return [
            p,
            {
              id: player.id,
              name: player.name,
              score: player.score,
              winner: winner === player.name,
            },
          ];
        })
      ),
      time: {
        duration: this.#timeFormated,
        startedAt: (() => {
          const time = this.#getTime(this.#matchStarted);
          return `${time.day}/${time.month}/${time.year} | ${time.hour}:${time.minute}:${time.second}`;
        })(),
      },
    };

    console.log(`Sent match ${this.#id} stats to backend`);
    lobby.send(stats);
    console.log(stats);
    this.#broadcast({ type: types.message.END_GAME });
  }
  input(id, direction, inputSeq = null) {
    try {
      const p = this.#players[id];

      if (!p) return;
      p.updateDirection(direction, inputSeq);
    } catch (error) {
      console.log("Error handling input:", error.message);
    }
  }
  ready(id) {
    this.#setPlayerReady(id);
  }
  #newBall() {
	  if (this.#gameEnded) return;
    if (!this.#allConnected)
      return this.#inactivityDisconnect(1);

    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }

    this.#ball = new Ball(this.#lastScorer);
    this.#ball.start();
  }
  //wip - this don not work yet
	  #bounce() {
    if (!this.#ball) return false;

		const ball = this.#ball.hitBox;
		const paddles = Object.entries(this.#players);
	    
		for (const [slot, player] of paddles) {
      const p = player.hitBox;
			const overlapX = ball.right >= p.left && ball.left <= p.right;
			const overlapY = ball.bot >= p.top && ball.top <= p.bot;

		if (!overlapX || !overlapY) continue;

		const goingRight = this.#ball.direction.x === RIGHT;
			const hit = (
				(goingRight && ball.right >= p.left) ||
				(!goingRight && ball.left <= p.right)
			);
			if (hit) {
        this.#lastBallTouchSlot = Number(slot);
				return (true);
      }
		}

		return (false);
  }
  #onScore(scorer) {
    if (this.#gameEnded) return;
  
    this.#lastScorer = scorer;
	    if (this.#ball)
	      this.#ball.stop();
      this.#ball = null;
      this.#powerUp = null;
      Object.values(this.#players).forEach((p) => {
        if (!this.#gameEnded && p.side === scorer && p.score < this.#maxScore) {
          p.score = p.score + 1;
          this.#newBall();
        }
        if (p.score >= this.#maxScore) this.endGame(p.info.name);
      });

    }
  // --- Cleanup ---
  destroy() {
    if (this.#timeout) clearTimeout(this.#timeout);
    if (this.#ball) this.#ball.stop();
    this.#ball = null;
    this.#powerUp = null;
    this.#activeEffects = [];
    this.#readyPlayers.clear();
    this.#timeout = null;
    this.#stopTimer();
    this.#stopMainLoop();
    Object.values(this.#players).forEach((p) => {
      if (p.ws && p.ws.readyState === p.ws.OPEN)
        p.ws.close(1000, "Match ended");
    });

    delete matches[this.#id];
  }
}
