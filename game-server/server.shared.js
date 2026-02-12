import 'dotenv/config';
import { Lobby } from './services/lobby.class.js';
import { loadJson } from './controllers/loadJson.js';

export const flappyMatches = {};
export const matches = {};
export const lobby = new Lobby();

export const stats = await loadJson('./game-stats.json') ?? {};

/*
	messages: used to manage types on sending
	errors: used in throwing errors
*/
export const types = {
	message: {
		ERROR: "ERROR",
		CONNECT_PLAYER: "PLAYER_CONNECTED",
		DISCONNECT_PLAYER: "PLAYER_DISCONNECTED",
		START_GAME: "START_GAME",
		END_GAME: "END_GAME",
		OPPONENT_CONNECTED: "OPPONENT_CONNECTION",
		OPPONENT_DISCONNECTED: "OPPONENT_CONNECTION",
		MATCH_CREATED: "MATCH_CREATED",
		LOBBY_CONNECTED: "LOBBY_CONNECTED",
		TIMEOUT_REMOVE: "TIMEOUT_REMOVE",
		PING: "PING",
		MATCH_REMOVED: "MATCH_REMOVED",
	},
	error: {
		NOT_CONNECTED: "NOT_CONNECTED",
		DUP: "DUPLICATE",
		NOT_FOUND: "NOT_FOUND",
		PLAYER_MISSING: "PLAYER_MISSING",
		TYPE_ERROR: "INVALID_DATA",
		PERMISSION_ERROR: "PERMISSION_DENIED",
		TOO_MANY_CONNECTIONS: "DDOS_DETECTED",
	},
	recieves: {
		CONNECT_PLAYER: "CONNECT_PLAYER",
		NEW_MATCH: "NEW_MATCH",
		REMOVE_MATCH: "REMOVE_MATCH",
		PING: "PING",
		CONNECT_LOBBY: "CONNECT_LOBBY",
		END_GAME: "END_GAME",
		INPUT: "INPUT",
		READY: "PLAYER_READY",
		BOUNCE: "BOUNCE",
	}
};

export const closeCodes = {
	NORMAL: 1000,
	POLICY_VIOLATION: 1008,
	INTERNAL_ERROR: 1011,
}

export const DISCONNECT_TIMEOUT = 60000; // 1 minute
export const INTERVALS = 1000; //1 second
export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;
export const LEFT = -1;
export const RIGHT = 1;
