import { Connection } from "./services/Connection.class.js";
import { MatchMaking } from "./services/MatchMaking.class.js";
import { Server } from "./services/Server.class.js";

const server = new Server();
const matchmaking = new MatchMaking();
const gameServer = new Connection();

export default {
	server,
	gameServer,
	matchmaking,
}