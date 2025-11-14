import type { GameState, GameType, IdentityType, Vector } from "./types";
import * as ex from "excalibur";

export const score: Record<number, {name: string, score: number}> = {};

export const gameState: GameType = {
	ballInGame: false,
	gameEnd: false,
	connected: false,
	gameStarted: false,
	opponentConnected: false,
	allOk: false,
	timer: "00:00",
	latency: 0,
	delta: 60000 / 60,
};

export const movePaddles: Record<number, {up: boolean, down: boolean}> = {
	1: {up: false, down: false},
	2: {up: false, down: false}
};

export const identity: IdentityType = {
	id: 0,
	playerId: 0,
	matchId: 0,
	name: "",
};

export const MAXSCORE: number = 11;
export const RECONNECTION__DELAY: number = 10000; //10 seconds

export const LANGUAGE =  "EN";

export  const texts: Record<string, {disconnect: string, win: string, waitOpponent: string}> = {}

texts["EN"] = {disconnect: "Awaiting connection", win: "won!", waitOpponent: "Waiting for opponent..."};
texts["PT"] = {disconnect: "Aguardando conexão", win: "ganhou!", waitOpponent: "Aguardando o oponente..."};

export const BACKGROUND =  Object.freeze({
	width: 800,
	height: 600,
	color: ex.Color.Black,
	displayMode: ex.DisplayMode.Fixed,
});

export const ballPos: Vector = {
	x: 0,
	y: 0,
}

export const state: GameState = {
	ballPos: {
		vector: {x: 0, y: 0},
		exist: false,
	},
	timer: "00:00",
	players: {
		1: {name: "", up: false, down: false, score: 0},
		2: {name: "", up: false, down: false, score: 0},
	},
	latency: 0,
	gameStarted: false,
	gameEnd: false,
	connection: {
		me: false,
		opponent: false,
	},
	allOk: false,
}
