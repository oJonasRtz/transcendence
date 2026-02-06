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

type PlayerStatsType = {
	id: string;
	name: string;
	score: number;
	winner: boolean;
	tier: string;
	rank_points: number;
};

type MatchTimeType = {
	duration: string;
	startedAt: string;
};

type StatsType = {
	match_id: number;
	result: 'WIN' | 'LOSS';
	pts: number;
	tier: string;
	rank_points: number;
	level: number;
	experience_points: number;
	experienceGained: number;
	stats: {
		game_type: string;
		players: Record<number, PlayerStatsType>;
		time: MatchTimeType;
	}
};

export class Match {
	private ws: WebSocket | null = null;
	private _game_type : 'RANKED' | 'TOURNAMENT' = 'RANKED';
	private info: InfoType = {
		name: null,
		email: null,
		id: null,
	};
	private interval: any = null;
	private _isConnected: boolean = false;
	private _state: string = 'IDLE';
	private onMatchFound: ((match_id: number, skip: boolean) => void) | null = null;
	private onMatchResults: ((stats: StatsType) => void) | null = null;
	private _match_id: number = 0;
	private party_users: PartyType[] = [];
	private party_token: string | null = null;
	private lastGameStats: StatsType | null = null;
	private savedSkins: {
		red: string;
		blue: string;
	} | null = null;
	public setSkins(red: string, blue: string) {
		this.savedSkins = { red, blue };
	}
	public getSkins() {
		return this.savedSkins;
	}
	private onPartyUpdate: (() => void) | null = null;
	private handlers: Record<string, Function> = {
		'STATE_CHANGE': async ({state}: {state: string}) => {
			this._state = state;
			// await this.updateState();
		},
		'MATCH_FOUND': ({match_id, skip}: {match_id: number, skip: boolean}) => {
			this._match_id = match_id;
			// window.location.href = '/dashboard/play/pong';
			// console.log('Match found! Match ID: ' + match_id + " skip: " + skip);
			if (this.onMatchFound) {
				this.onMatchFound(match_id, skip);
			}
		},
		'PARTY_UPDATED': async () => {
			try {
				await this.getPartyInfo();;
				// console.log('Party info updated:', this.party_users);
				if (this.onPartyUpdate) this.onPartyUpdate();
			} catch (error) {
				console.error('Error updating party info:', error);
			}
		},
		'MATCH_RESULT': (data: any) => {
			const {type, ...rest} = data;

			this.lastGameStats = rest as StatsType;

			// console.log('Match results received:', this.lastGameStats);

			if (this.onMatchResults && this.lastGameStats) {
				this.onMatchResults(this.lastGameStats);
			}
		},
		'PARTY_CREATED': ({token}: {token: string}) => {
			this.party_token = token;
			// console.log('Party invite created. Token:', token);
		},
		'MATCH_TIMEOUT': () => {
			this._match_id = 0;
		}
	};

	get stats(): StatsType | null {
		return this.lastGameStats;
	}

	get partyToken(): string | null {
		return this.party_token;
	}

	get inQueue(): boolean {
		return this._state === 'IN_QUEUE';
	}

	resetStats() {
		this.lastGameStats = null;
		this._match_id = 0;
		this.leaveParty();
	}

	set onParty(callback: (() => void) | null) {
		this.onPartyUpdate = callback;
	}

	get party(): PartyType[] {
		return this.party_users;
	}

	set onMatch(callback: (match_id: number, skip: boolean) => void) {
		this.onMatchFound = callback;
	}

	set onResults(callback: (stats: StatsType) => void) {
		this.onMatchResults = callback;
	}

	get matchInfo() {
		return {
			match_id: this._match_id,
			name: this.info.name ?? '',
			user_id: this.info.id || '',
		}
	}
	
	get isConnected(): boolean {
		return Boolean(this.ws) && this.ws?.readyState === WebSocket.OPEN;
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

		};
		this.ws.onmessage = (message: any) => {
			try {
				const data = JSON.parse(message.data);
				const {type} = data;

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

		// console.log('Im connecting with ' + JSON.stringify(this.info));

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
		this.resetStats();
		// await this.updateState();
	}

	/**
	 * Enqueue the user into the matchmaking queue for a specified game type.
	 * @param type - The type of game for matchmaking ('RANKED' or 'TOURNAMENT').
	 * @return boolean - Returns true if the enqueue request was sent successfully, false otherwise.
	*/
	public enqueue(type: 'RANKED' | 'TOURNAMENT' = 'RANKED'): boolean {

		// console.log("Current state:", this.state);
		if (this.state !== 'IDLE') return false;

		// console.log("I tried to enqueue for type:", type);

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
		// console.log("Current state:", this.state);
		if (this.state !== 'IN_QUEUE') return false;

		// console.log("I tried to dequeue");
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

	public async joinParty(game_type: 'RANKED' | 'TOURNAMENT', token: string | null = null): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			const interval = setInterval(() => {
				if (this.isConnected) {
					clearInterval(interval);
					resolve();
				}
			}, 50);
		});
		
		await fetch('/api/match', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
			  action: 'joinParty',
			  id: this.info.id,
			  game_type,
			  token: token || null,
			}),
			credentials: 'include',
		  });

		//   console.log("I tried to join the party");

		  this.getPartyInfo();
	}

	public async leaveParty(): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			const interval = setInterval(() => {
				if (this.isConnected) {
					clearInterval(interval);
					resolve();
				}
			}, 50);
		});

		await fetch('/api/match', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
			  action: 'leaveParty',
			  id: this.info.id,
			}),
			credentials: 'include',
		  });

		//   console.log("I tried to leave the party");

		  this.party_users = [];
		  this.party_token = null;
	}

	private async getPartyInfo(): Promise<void> {
		const res = await fetch(`/api/match?user_id=${this.info.id}`, {
		  method: 'GET',
		  credentials: 'include',
		});
	  
		if (!res.ok) throw new Error(`Failed to fetch party info: ${res.statusText}`);
	  
		const data = await res.json();
		this.party_users = data.party?.clients || [];
	}
	  

	// private async updateState(): Promise<void> {
	// 	await axios.post('https://users-service:3003/setUserState', {
	// 		email: this.info.email,
	// 		state: this._state,
	// 	});
	// }
}
