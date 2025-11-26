import axios from "axios";

export class DataBase {
    #inGame = false;

    async #sendRequest(endpoint, payload = {}) {
        const response = await axios.post(`http://users-service:3003/${endpoint}`, payload);
        return response.data;
    }

    async getQueue() {
        return (this.#sendRequest('getQueue'));
    }

    async setInQueue(email, inQueue = false) {
        return (this.#sendRequest('setInQueue', { email: email, inQueue: inQueue }));
    }

    async setRank(email, rank) {
        return (this.#sendRequest('setRank', { email: email, rank: rank }));
    }

    async setInGame(email, inGame = undefined) {
        this.#inGame = inGame !== undefined ? inGame : !this.#inGame;
        return (this.#sendRequest("setInGame", {email: email, inGame: this.#inGame}));
    }

    async setMatchId(email, match_id) {
        return (this.#sendRequest("setMatchId", { email: email, match_id: match_id }));
    }
}
