export class FlappyPlayer {
    #id;
    #matchId;
    #name;
    #score = 0;
    #connected = false;
    #isAlive = true;
    #ws = null;

    constructor({id, name}) {
        this.#id = id;
        this.#name = name;
    }

    get id() {
        return this.#id;
    }

    get isAlive() {
        return this.#isAlive;
    }

    setDeath() {
        this.#isAlive = false;
    }

    get isConnected() {
        return this.#connected;
    }

    get info() {
        return {
            id: this.#id,
            name: this.#name,
            score: this.#score,
        };
    }

    connect({ws, id, name, matchId}) {
        if (this.#connected)
            throw new Error(types.error.ALREADY_CONNECTED);
        if (id !== this.#id || name !== this.#name)
            throw new Error(types.error.NOT_FOUND);
        
        this.#ws = ws;
        this.#connected = true;
        this.#matchId = matchId;
    }

    markScore(score = 1) {
        if (!this.#isAlive) return;

        this.#score += score;
    }

    send(message) {
        if(!this.#connected || !this.#ws) return;

        if (this.#ws.readyState === this.#ws.OPEN)
            this.#ws.send(JSON.stringify(message));
    }

    disconnect() {
        if (!this.#connected) return;

        if (this.#ws)
            this.#ws.close();

        this.#connected = false;
        this.#ws = null;
    }
}
