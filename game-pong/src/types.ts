export type Vector = {
	x: number;
	y: number;
}

export type GameType = {
	ballInGame: boolean;
	connected: boolean;
	gameStarted: boolean;
	gameEnd: boolean;
	opponentConnected: boolean;
	allOk: boolean;
	timer: string;
	latency: number;
	delta: number;
}

export type InputType = {
	id: number;
	matchId: number;
	type: string;
	up: boolean;
	down: boolean;
}

export type IdentityType = {
	id: number;
	playerId: number;
	matchId: number;
	name: string;
}

type Connection = {
	me: boolean;
	opponent: boolean;
}

export type GameState = {
	ballPos: {vector: Vector, exist: boolean};
	timer: string;
	players: Record<1 | 2, {name: string; up: boolean; down: boolean; score: number;}>;
	latency: number;
	gameStarted: boolean;
	gameEnd: boolean;
	connection: Connection;
	allOk: boolean;
}
