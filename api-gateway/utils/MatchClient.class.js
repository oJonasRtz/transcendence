import WebSocket from "ws";

export class MatchClient {
  #ws = null;
  #messages = [];
  #url = "wss://match-service:3010";
  #info = {
    name: null,
    email: null,
    id: null
  };
  #isConnected = false;
  #state = 'IDLE';
  #handlers = {
    'STATE_CHANGE': ({state}) => {this.#state = state;},
    'CONNECTED': () => {this.#isConnected = true; console.log("Match Service connection established");},
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
        console.error("Error parsing message from Match Service:", error);        
      }
    });
  }

  connect({name, email, id}) {
    this.#ws = new WebSocket(this.#url);
    this.#info.name = name;
    this.#info.id = id;
    this.#info.email = email;
    
    this.#listeners();
  }

  enqueue() {
    this.#send({
      type: "ENQUEUE",
      id: this.#info.id,
      game_type: "RANKED"
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
}

// export default new MatchClient('ws://match-service:3010');
