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

  get isConnected() {
    return this.#isConnected;
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
        
        const {type} = data;

        if (type === "CONNECTED") {
          console.log("Match Service connection established");
          this.#isConnected = true;
        }

        console.log("Received message from Match Service:", data);
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

  #send(data) {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) return;
    this.#ws.send(JSON.stringify(data));
  }

  get messages() {
    return this.#messages;
  }
}

// export default new MatchClient('ws://match-service:3010');
