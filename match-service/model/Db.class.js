import axios from "axios";

export class DataBase {
    #inGame = false;

    async getQueue() {
        const response = await axios.post('http://users-service/getQueue', {});
        return response.data;
    }

    async setInQueue(email, inQueue = false) {
        await axios.post('http://users-service/setIsQueue', {
            email: email,
            inQueue: inQueue
        });
    }

    async setRank(email, rank) {
        await axios.post('http://users-service/setRank', {
            email: email,
            rank: rank
        });
    }

    async setInGame(email) {
        this.#inGame = !this.#inGame;
        await axios.post('http://users-service/setInGame', {
            email: email,
            inGame: this.#inGame
        });
    }
}
