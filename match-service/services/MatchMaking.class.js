import { DataBase } from "../model/Db.class";
import { con } from "../app.js";

export class MatchMaking {
    #db =  new DataBase();


    async #findMatch(req) {
        if (!req.body || !req.body.email)
            throw new Error("You need to inform an email here");

        const queue = await this.#db.getQueue();
        
        const ids = [];
        /*
            Ids calculation logic here
        */

        const matchId = con.newMatch(ids);

        return matchId;
    }

    async newMatch(req, reply) {
        let matchId = 0;
        try {
            matchId = await this.#findMatch(req);
        } catch (error) {}

        reply.code(200).send({ matchId: matchId });
    }

    async calculateRank() {
        let winner, loser;

        //Template, i gotta refactor the setter
        this.#db.setRank(winner, /* new rank value */);
        this.#db.setRank(loser, /* new rank value */);
    }
}
