import { DataBase } from "../model/Db.class";

export class MatchMaking {
    #db =  new DataBase();

    async newMatch(req, reply) {
        reply.send({ message: "New match request received" });
    }
}