import { createId } from "../../controllers/createId.js";
import { FlappyPlayer } from "./FlappyPlayer.class.js";

export class FlappyMatch {
    #id;
    #players = {};
    #started = false;
    #scorePerPoint = 1;
    #pingInterval = null;
    
    constructor({players}) {
        Object.values(players).forEach((p, i) => {
            const index = i + 1;
            this.#players[index] = new FlappyPlayer({id: p.id, name: p.name});
        });

        this.#id = createId(...players.slice(0, 2).map(p => p.id));
        this.#inactivityDisconnect(5);
    }

    get id() {
        return this.#id;
    }

    start() {
        if (this.#started || !Object.values(this.#players).every(player => player.isConnected)) return;

        this.#started = true;
        this.#ping();
    }

    #ping() {

    }

    #inactivityDisconnect(minutes = 1) {
        const timeoutDuration = minutes * 60 * 1000;

        setTimeout(() => {
            this.#end();
        }, timeoutDuration);
    }
    #end() {
        const isEnd = Object.values(this.#players)
                    .map(player => player.isAlive)
                    .length === 1;

        if (!isEnd) return;


        const info = [];
        this.#players.forEach(player => {
            info.push(player.info);
        });

        
    }
}
