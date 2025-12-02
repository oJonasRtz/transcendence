import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import {waitGameStart} from '../src/main';
import { Game } from "../src/view/game.class";
import type { FastifyRequest, FastifyReply } from 'fastify';
import { gameState } from '../src/globals';

export class Server {
    #app = Fastify();
    #routes = [
        { method: 'POST', url: '/start-pong', handler: this.#startPong.bind(this) },
    ];

    constructor() {
        this.#app.register(cookie, {
            secret: process.env.COOKIE_SECRET || 'purpleVoid',
            hook: 'onRequest'
        });

        this.#app.register(formbody);
    }

    listen(port = 3004) {
        this.#app.listen({ port, host: "0.0.0.0" }, (err, address) => {
            if (err)
                console.error(err);
            console.log(`Server listening at ${address}`);
        });
    }


    routes() {
        for (const route of this.#routes) 
            this.#app.route(route);
    }

    //Controlers
    async #startPong(req: FastifyRequest, reply: FastifyReply) {
        if (!req.body) return;

        try {
            const { matchId, name, playerId } = req.body;
            
            gameState.setIdentity({ matchId: Number(matchId), name: String(name), playerId: Number(playerId) });
            await waitGameStart();
            const game = new Game();
            game.start();
            reply.send({ status: 'OK' });
        } catch (error) {
            console.error("Error in /start-pong:", error);
            reply.status(500).send({ status: 'ERROR'});
        }
    }
}