import { Connection } from "./services/Connection.class.js";
import { MatchMaking } from "./services/MatchMaking.class.js";
import { Server } from "./services/Server.class.js";

export const server = new Server();
export const matchMaking = new MatchMaking();
export const gameServer = new Connection();
