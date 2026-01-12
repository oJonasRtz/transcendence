import WebSocket from "ws";
import { matchClient } from "../app.js";
import axios from "axios";

export class MatchClient {
  #ws = null;
  #messages = [];
  #url = "wss://match-service:3010";
  #info = {
    name: null,
    email: null,
    id: null,
    token: null,
  };
  #isConnected = false;
  #state = 'IDLE';
  #match_id = null;
  #handlers = {
    'STATE_CHANGE': async ({state}) => {
      this.#state = state;
      await axios.post('https://users-service:3003/setUserState', {
        email: this.#info.email,
        state: state,
      });
    },
    'CONNECTED': () => {this.#isConnected = true; console.log("Match Service connection established");},
    'MATCH_FOUND': async ({match_id}) => {
      this.#match_id = match_id;
      console.log(`Match found! Match ID: ${match_id}`);
      // await axios.post('https://api-gateway:3000/matchFound');
    },
    'MATCH_ENDED': () => this.#match_id = null,
  };

  get isConnected() {
    return this.#isConnected;
  }

  get state() {
    return this.#state;
  }

  #listeners() {
    this.#ws.on("open", () => {
      console.log("Connected to Match Service");
      this.#send({
        type: "CONNECT",
        name: this.#info.name,
        email: this.#info.email,
        id: this.#info.id
      });
    });
    this.#ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Received message from Match Service:", data);

        const {type} = data;
        if (!type || !(type in this.#handlers)) 
          throw new Error("__TYPE_ERROR__");

        this.#handlers[type](data);
      } catch (error) {
        console.error("Error parsing message from Match Service:", error.message);        
      }
    });
    this.#ws.on("close", () => {
      if (matchClient.has(this.#info.token))
        matchClient.delete(this.#info.token);
    
      this.#isConnected = false;
      console.log("Disconnected from Match Service");
    });
  }

  connect({name, email, id, token}) {
    this.#ws = new WebSocket(this.#url);
    this.#info.name = name;
    this.#info.id = id;
    this.#info.email = email;
    this.#info.token = token;
    
    this.#listeners();
  }

  enqueue(type = 'RANKED') {
    this.#send({
      type: "ENQUEUE",
      id: this.#info.id,
      game_type: type
    });
  }

  dequeue() {
    this.#send({
      type: "DEQUEUE",
      id: this.#info.id
    });
  }

  #send(data) {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) return;
    this.#ws.send(JSON.stringify(data));
  }

  get messages() {
    return this.#messages;
  }

  async disconnect() {
    if (!this.#ws) return;

    this.#ws.close();
    this.#ws = null;
    this .#isConnected = false;
    await axios.post('https://users-service:3003/setUserState', {
      email: this.#info.email,
      state: 'OFFLINE',
    });
  }
}

// export default new MatchClient('ws://match-service:3010');
