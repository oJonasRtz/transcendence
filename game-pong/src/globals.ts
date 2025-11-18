import { Connection } from "./controllers/Connection.class";
import { Identity } from "./controllers/Identity.class";
import { State } from "./controllers/State.class";

export const identity = new Identity();
export const MAXSCORE: number = 11;
export const RECONNECTION__DELAY: number = 5000; //10 seconds
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
