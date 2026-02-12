import { gameState, RECONNECTION__DELAY, types } from "../globals";

type Handler = (data: any) => void;
type PlayerState = {
  id: string;
  name: string;
  score: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  connected: boolean;
  lastInputSeq?: number;
}
type PowerUpState = {
  id: number;
  type: string;
  color: string;
  position: { x: number; y: number };
  radius: number;
} | null;
type EffectState = {
  id: number;
  type: string;
  targetSlot: 1 | 2;
  color: string;
  remainingMs: number;
}

export class Connection {
  private socket: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;
  private canSendReady = false;
  private connectedPromise: Promise<1 | 2> | null = null;
  private connectedResolve: ((slot: 1 | 2) => void) | null = null;
  private lastConnectedSlot: 1 | 2 | null = null;
  private handlers: Record<string, Handler> = {
    [types.PING]: this.updateState.bind(this),
    [types.PONG]: () => {
      gameState.setLatency();
    },
    [types.CONNECTED]: (data) => {
      const slot = Number(data?.id);
      if (slot !== 1 && slot !== 2) return;

      gameState.setId(slot);
      gameState.setConnection(true);
      this.lastConnectedSlot = slot;

      if (this.connectedResolve) {
        this.connectedResolve(slot);
        this.connectedResolve = null;
        this.connectedPromise = null;
      }

      if (this.canSendReady) {
        this.sendReady();
      }
    },
  };

  private getWdUrl(): string {
    const host = window.location.host.split(":")[0];

    return `wss://${host}/pong-ws/`;
  }
  private clearReconnectTimeout(): void {
    if (!this.reconnectTimeout) return;
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }
  
	  public connect(forceReconnect: boolean = false): void {
    const activeSocket = this.socket;
    if (activeSocket && forceReconnect) {
      this.disconnect("Resetting active socket");
    } else if (
      activeSocket &&
      (activeSocket.readyState === WebSocket.OPEN ||
        activeSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

	    this.shouldReconnect = true;
	    this.clearReconnectTimeout();
      this.connectedPromise = null;
      this.connectedResolve = null;
      this.lastConnectedSlot = null;

	    const url: string = this.getWdUrl();
	    console.log(`Connecting to WebSocket server at ${url}...`);
	    const socket = new WebSocket(url);
	    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket) return;
      const { matchId, name, id, playerId } = gameState.getIdentity();
      console.log("tentando conexao na partida: " + matchId);

      this.send({ type: types.CONNECT, matchId, name, id, playerId });
	      // gameState.getLatency((msg) => this.send(msg));
	      
	      gameState.setConnection(true);
	    };
	  gameState.checkKeys((msg) => this.send(msg));

    socket.onmessage = (event) => {
      if (this.socket !== socket) return;
      const data = JSON.parse(event.data);

      // if (data.type !== types.PONG && data.type !== types.PING)
      //   console.log("Message from server:", { data });

      this.handleType(data);
    };

    socket.onerror = (error) => {
      if (this.socket !== socket) return;
      console.error("WebSocket error:", error);
      gameState.setConnection(false);
    };

    socket.onclose = (event) => {
      if (this.socket !== socket) return;
      this.socket = null;

      const { gameEnd } = gameState.getGame();
      if (gameEnd) return;
      if (!this.shouldReconnect) return;

      //Reconnection
      gameState.setConnection(false);
      console.log(`Disconnected from WebSocket server: ${event.reason}`);
      console.log(
        `Trying to reconnect in ${RECONNECTION__DELAY / 1000} seconds...`
      );
      this.clearReconnectTimeout();
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        if (!this.shouldReconnect) return;
        this.connect();
      }, RECONNECTION__DELAY);
    };
  }

	  public disconnect(reason: string): void {
	    this.shouldReconnect = false;
	    this.clearReconnectTimeout();
	    const socket = this.socket;
	    this.socket = null;
      this.connectedPromise = null;
      this.connectedResolve = null;
      this.lastConnectedSlot = null;

	    if (!socket) {
	      gameState.setConnection(false);
	      return;
	    }

    // gameState.stopGettingLatency();
    console.log(`[disconnectPlayer] Disconnecting from server: ${reason}`);
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close(1000, reason);
    }
    gameState.setConnection(false);
  }

	  private send(data: any): void {
	    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
	    this.socket.send(JSON.stringify(data));
	  }

    public setCanSendReady(canSend: boolean): void {
      this.canSendReady = Boolean(canSend);
      if (this.canSendReady) {
        this.sendReady();
      }
    }

    public waitForConnected(): Promise<1 | 2> {
      if (this.lastConnectedSlot) return Promise.resolve(this.lastConnectedSlot);
      if (this.connectedPromise) return this.connectedPromise;

      this.connectedPromise = new Promise((resolve) => {
        this.connectedResolve = resolve;
      });
      return this.connectedPromise;
    }

    public sendReady(): void {
      const { matchId, id } = gameState.getIdentity();
      if (id !== 1 && id !== 2) return;
      if (!matchId) return;
      this.send({ type: types.READY, matchId, id });
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
      const { timestamp, ball, game, players, powerUp, effects } = data as any;
      gameState.pushSnapshot({
        timestamp: Number(timestamp),
        ball: {
          exists: Boolean(ball?.exists),
          position: ball?.position
            ? { x: Number(ball.position.x) || 0, y: Number(ball.position.y) || 0 }
            : undefined,
        },
        game: {
          started: Boolean(game?.started),
          ended: Boolean(game?.ended),
          time: game?.time ?? "00:00",
        },
        players: (players as Record<string, PlayerState>) ?? {},
        powerUp: powerUp as PowerUpState,
        effects: (effects as EffectState[]) ?? [],
      });
    } catch (error) {
      console.error("Error updating state:", error);
    }
  }

  //Notifications
  // private notifyEnd(): void {
  //   const { gameEnd } = gameState.getGame();

  //   if (!gameEnd) return;
  //   this.send({ type: types.END_GAME });
  // }
}
