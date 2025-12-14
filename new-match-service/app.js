import { Connection } from "./services/Connection.class.js";
import { Server } from "./services/Server.class.js";

const server = new Server();
const gameServer = new Connection();

export default {
	server,
	gameServer
}