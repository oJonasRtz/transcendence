import { Connection } from "./classes/Connection.class";
import { Identity } from "./classes/Identity.class";
import { State } from "./classes/State.class";

export const identity = new Identity();
export const MAXSCORE: number = 11;
export const RECONNECTION__DELAY: number = 10000; //10 seconds
export const INTERVAL: number = 1000; //1 second

//Messages types for WebSocket communication
export const types = {
  CONNECT: "CONNECT_PLAYER",
  CONNECTED: "PLAYER_CONNECTED",
  PING: "PING",
  PONG: "PONG",
  INPUT: "INPUT",
  END_GAME: "END_GAME",
  BOUNCE: "BOUNCE",
};

export const connection = new Connection();
export const gameState = new State();
