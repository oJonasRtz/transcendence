
export class Identity {
	/*
		name: player's name
		matchId: match identification number
		playerId: player's identification number(backend)
		id: players side in the game
	*/
	private name: string;
	private matchId: number;
	private playerId: number | string;
	private id: 1 | 2 | 0;

	constructor() {
		this.name = "";
		this.matchId = 0;
		this.playerId = 0;
		this.id = 0;
	}
	public reset() {
		this.name = "";
		this.matchId = 0;
		this.playerId = 0;
		this.id = 0;
	}

	//Alterar fututuramente para consultar o backend
	public setInfo({name, matchId, playerId}: {name: string; matchId: number; playerId: number | string;}) {
		const invalidData = [
			name.trim() === "",
			matchId < 1,
			!playerId,
		].some(Boolean);
		
		if (invalidData)
			return;

		this.name = name;
		this.matchId = matchId;
		this.playerId = playerId;
	};

	public getInfo() {
		return {
			name: this.name,
			matchId: this.matchId,
			id: this.id,
			playerId: this.playerId,
		}
	}

	public setId(id: 1 | 2) {
		this.id = id;
	}
}
