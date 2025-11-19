import { gameState, RECONNECTION__DELAY, types } from "../globals";

type Handler = (data: any) => void;

export class Connection {
  private socket: WebSocket | null = null;
  private server = {
    ip: "10.13.1.1",
    port: 8443,
  };
  private handlers: Record<string, Handler> = {
    [types.PING]: this.updateState.bind(this),
    [types.PONG]: () => {
      gameState.setLatency();
    },
    [types.CONNECTED]: (data) => {
      const { id } = data;

      if (id) gameState.setId(id);
    },
  };

  public connect(): void {
    this.socket = new WebSocket(`wss://${this.server.ip}:${this.server.port}`);

    this.socket.onopen = () => {
      const { matchId, name, id, playerId } = gameState.getIdentity();

      this.send({ type: types.CONNECT, matchId, name, id, playerId });
      gameState.getLatency((msg) => this.send(msg));
      gameState.setConnection(true);
    };
  gameState.checkKeys((msg) => this.send(msg));

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type !== types.PONG && data.type !== types.PING)
        console.log("Message from server:", { data });

      this.handleType(data);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      gameState.setConnection(false);
    };

    this.socket.onclose = (event) => {
      const { gameEnd } = gameState.getGame();
      if (gameEnd) return;

      //Reconnection
      gameState.setConnection(false);
      console.log(`Disconnected from WebSocket server: ${event.reason}`);
      console.log(
        `Trying to reconnect in ${RECONNECTION__DELAY / 1000} seconds...`
      );
      setTimeout(() => this.connect(), RECONNECTION__DELAY);
    };
  }

  public disconnect(reason: string): void {
    if (!this.socket) return;

    gameState.stopGettingLatency();
    console.log(`[disconnectPlayer] Disconnecting from server: ${reason}`);
    this.socket.close(1000, reason);
    this.socket = null;
    gameState.setConnection(false);
  }

  private send(data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(data));
  }

  //Handle messages
  private handleType(data: Object): void {
    try {
      const type: string = (data as any).type;
      const func = this.handlers[type as keyof typeof this.handlers];
      if (!func) return;

      func(data);
    } catch (error) {
      console.error("[handleType] Error handling data:", data, error);
    }
  }
  private updateState(data: Object): void {
    try {
      console.log("Updating state with data:", data);

      const { ball, game, players } = data as any;

      console.log("[updateState] Ball data:", ball);
      gameState.setBall({ exist: ball.exists, vector: ball.position });

      for (const [key, val] of Object.entries(players)) {
        const i: number = Number(key);
        if (i !== 1 && i !== 2) continue;

        gameState.setPlayer({
          id: i,
          name: val.name,
          score: val.score,
          pos: {x: val.position.x, y: val.position.y},
          size: {width: val.size.width, height: val.size.height},
          connected: val.connected,
        });
      }

      gameState.setGame({
        gameStarted: game.started,
        gameEnd: game.ended,
        timer: game.time,
      });
    } catch (error) {
      console.error("Error updating state:", error);
    }
  }

  //Notifications
  private notifyEnd(): void {
    const { gameEnd } = gameState.getGame();

    if (!gameEnd) return;
    this.send({ type: types.END_GAME });
  }
}
