// import WebSocket from 'ws';
// import axios from 'axios';

import { partyInfo } from "./route";

type InfoType = {
	name: string | null;
	email: string | null;
	id: string | null;
};

type PartyType = {
	id: string;
	name: string;
	rank: number;
	isLeader: boolean;
};

export class Match {
	private ws: WebSocket | null = null;
	private _game_type : 'RANKED' | 'TOURNAMENT' = 'RANKED';
	private info: InfoType = {
		name: null,
		email: null,
		id: null,
	};
	private _isConnected: boolean = false;
	private _state: string = 'OFFLINE';
	private _match_id: number = 0;
	private party_users: PartyType[] = [];
	private handlers: Record<string, Function> = {
		'STATE_CHANGE': async ({state}: {state: string}) => {
			this._state = state;
			// await this.updateState();
		},
		'MATCH_FOUND': ({match_id}: {match_id: number}) => {
			this._match_id = match_id;
			// window.location.href = '/dashboard/play/pong';
			console.log('Match found! Match ID:', match_id);
		},
		'PARTY_UPDATED': async () => {
			try {
				if (!this.info.id) return;

				const res = await fetch('/api/match-service/partyInfo?user_id=' + this.info.id, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				});

				if (!res.ok) 
					throw new Error(`Failed to fetch party info: ${res.statusText}`);

				const data = await res.json();

				this.party_users = data.party?.clients || [];

				console.log('Party info updated:', this.party_users);

			} catch (error) {
				console.error('Error updating party info:', error);
			}
		},
	};

	get party(): PartyType[] {
		return this.party_users;
	}

	get matchInfo() {
		return {
			match_id: this._match_id,
			name: this.info.name ?? '',
			user_id: this.info.id || '',
		}
	}
	
	get isConnected(): boolean {
		return this.ws && this.ws.readyState === WebSocket.OPEN;
	}

	get state(): string {
		return this._state;
	}

	set game_type(type: 'RANKED' | 'TOURNAMENT') {
		this._game_type = type;
	}

	get game_type(): 'RANKED' | 'TOURNAMENT' {
		return this._game_type;
	}

	get match_id() {
		return this._match_id;
	}

	private listeners() {
		if (!this.ws) return;

		this.ws.onopen = () => {
			this.send({
				type: 'CONNECT',
				name: this.info.name,
				email: this.info.email,
				id: this.info.id,
			});
			this._isConnected = true;
			console.log("conexao estabelecida");
		};
		this.ws.onmessage = (message: any) => {
			try {
				const data = JSON.parse(message.data);
				const {type} = data;

				console.log("mensagem recebida:", JSON.stringify(data));

				if (!type || !(type in this.handlers)) 
					throw new Error(`__TYPE_ERROR__`);

				this.handlers[type](data);

			} catch (error: any) {
				console.error('Error parsing message from match-service:', error.message);
			}
		};
		
		this.ws.onerror = (error: any) => {
			console.error('WebSocket error:', error.message);
		};

		this.ws.onclose = (event: any) => {
			console.log(`WebSocket connection closed: ${event.reason}`);

			this._isConnected = false;
			// setTimeout(() => {this.connect({name: this.info.name!, email: this.info.email!, id: this.info.id!})}, 5000);
		};
	}

	private getUrl(): string {
		const host = window.location.host.split(":")[0];

		return 'wss://' + host + '/match-ws/';
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

		if (this._isConnected && this.ws?.readyState === WebSocket.OPEN) return;

		const wsUrl: string = this.getUrl();
		this.ws = new WebSocket(wsUrl);

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
		// await this.updateState();
	}

	/**
	 * Enqueue the user into the matchmaking queue for a specified game type.
	 * @param type - The type of game for matchmaking ('RANKED' or 'TOURNAMENT').
	 * @return boolean - Returns true if the enqueue request was sent successfully, false otherwise.
	*/
	public enqueue(type: 'RANKED' | 'TOURNAMENT' = 'RANKED'): boolean {
		if (this.state !== 'IDLE') return false;

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
		if (this.state !== 'IN_QUEUE') return false;
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

	// private async updateState(): Promise<void> {
	// 	await axios.post('https://users-service:3003/setUserState', {
	// 		email: this.info.email,
	// 		state: this._state,
	// 	});
	// }
}
