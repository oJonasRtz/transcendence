import { connection } from "websocket";
import { Server } from "./services/Server.class";
import { DataBase } from "./model/Db.class";

const	db = new DataBase();
const 	lobby = new connection();
const 	server = new Server();

export { db, lobby, server };