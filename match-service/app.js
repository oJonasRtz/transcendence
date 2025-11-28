import { Server } from "./services/Server.class.js";
import { DataBase } from "./model/Db.class.js";
import { Connection } from "./services/Connection.class.js";

const	db = new DataBase();
const 	lobby = new Connection();
const 	server = new Server();

export { db, lobby, server };