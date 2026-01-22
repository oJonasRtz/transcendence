import WebSocket from 'ws';
import axios from 'axios';

type InfoType = {
	name: string | null;
	email: string | null;
	id: string | null;
};

export class Match {
	private serviceUrl: string = 'match-service:3010';
	private ws: WebSocket | null = null;
	private info: InfoType = {
		name: null,
		email: null,
		id: null,
	};
	private _isConnected: boolean = false;
	private _state: string = 'OFFLINE';
	private _match_id: number | null = null;
	private handlers: Record<string, Function> = {};
	
	get isConnected(): boolean {
		return this._isConnected;
	}

	get state(): string {
		return this._state;
	}

	private listeners() {
		if (!this.ws) return;

		this.ws.on('open', () => {});
		this.ws.on('message', (message) => {});
		this.ws.on('error', (err) => {});
		this.ws.on('close', () => {});
	}

	/**
	 * Connect the user to match-service via WebSocket and get user info for identification.
	 * @param param0 - Object containing user information.
	 * @param {string} param0.name - The nickname of the user.
	 * 	@param {string} param0.email - The email of the user.
	 * @param {string} param0.id - The unique identifier of the user.
	 * @return void
	*/
	public connect({name, email, id}: {name: string, email: string, id: string}): void {
		this.info = {name, email, id};
		this.ws = new WebSocket();

		this.listeners();
	}

	/**
	 * Disconnect the user from match-service WebSocket and update user state to OFFLINE.
	 * @return void
	*/
	public async disconnect(): Promise<void> {
		if (!this.ws) return;

		this.ws.close();
		this.ws = null;
		this._isConnected = false;
		this._state = 'OFFLINE';
		await this.updateState();
	}

	/**
	 * Enqueue the user into the matchmaking queue for a specified game type.
	 * @param type - The type of game for matchmaking ('RANKED' or 'TOURNAMENT').
	 * @return boolean - Returns true if the enqueue request was sent successfully, false otherwise.
	*/
	public enqueue(type: 'RANKED' | 'TOURNAMENT' = 'RANKED'): boolean {
		return this.send({
			type: 'ENQUEUE',
			id: this.info.id,
			game_type: type,
		});
	}

	/**
	 * Dequeue the user from the matchmaking queue.
	 * @return boolean - Returns true if the dequeue request was sent successfully, false otherwise.
	*/
	public dequeue(): boolean {
		return this.send({
			type: 'DEQUEUE',
			id: this.info.id,
		});
	}

	private send(data: any): boolean {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
		this.ws.send(JSON.stringify(data));
		return true;
	}

	private async updateState(): Promise<void> {
		await axios.post('https://users-service:3003/setUserState', {
			email: this.info.email,
			state: this._state,
		});
	}
}
