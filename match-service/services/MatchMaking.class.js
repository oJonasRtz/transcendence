import { DataBase } from "../model/Db.class";
import { con } from "../app.js";

export class MatchMaking {
    #db =  new DataBase();
    #waitingQueue = new Map();

    constructor() {
        setInterval(() => this.#tryMatchPlayers(), 500);
    }

    async newMatch(req, reply) {
        try {
            const email = req.body.email;
            if (!email)
                return reply.code(400).send("You need to inform an email here");

            await this.#db.setInQueue(email, true);

            const myPromisse = new Promise((resolve) => {
                this.#waitingQueue.set(email, {resolve});
            });
            const result = await myPromisse;

            return reply.code(200).send(result);
        } catch (error) {}
    }

    async #tryMatchPlayers() {
        const queue = await this.#db.getQueue();
        if (queue.length < 2) return;

        const players = queue.slice(0, 2);
        const maxPlayers = 2;
        //Logic to get players

        const p = players.reduce((acc, cur, index) => {
            acc[index + 1] = {
                name: cur.name,
                id: cur.user_id,
            }
            return acc;
        }, {});
        const matchId = await con.newMatch(p, maxPlayers);
        for (const p of players) {
            const email = p.email;
            const entry = this.#waitingQueue.get(email);
            if (entry) {
                entry.resolve({ matchId });
                this.stopQueue(email);
            }

            await this.#db.setMatchId(email, matchId);
            await this.#db.setInGame(email, true);
        }
    }

    stopQueue(email) {
        if (this.#waitingQueue.has(email))
            this.#waitingQueue.delete(email);

        this.#db.setInQueue(email, false);
    }
}
