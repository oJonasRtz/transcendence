export class State {
	private gameStarted:boolean = false;
	private gameEnded: boolean = false;
	private isPaused: boolean = false;
	private score: number = 0;
	private highScore: number = 0;

	private updateHighScore() {
		//Chamar model que atualiza no bando de dados dps
		if (this.score > this.highScore) {
			this.highScore = this.score;
		}
	}

	public startGame() {
		if (this.gameStarted) return;

		this.score = 0;
		this.gameStarted = true;
	}
	public isGameStarted(): boolean {
		return this.gameStarted;
	}
	public endGame() {
		if (this.gameEnded || !this.gameStarted) return;

		this.gameEnded = true;
		this.updateHighScore();
	}
	public isGameEnded(): boolean {
		return this.gameEnded;
	}
	//Pauses and unpauses the game
	public gamePause() {
		this.isPaused = !this.isPaused;
		//logic to pause menu
	}
	public isGamePaused(): boolean {
		return this.isPaused;
	}
	public getScore(): number {
		return this.score;
	}
	public incrementScore(points: number) {
		console.log('fui chamado');
		if (!this.gameStarted || this.gameEnded) return;
		this.score += points;

		console.log(`[Score] Pontos: ${this.score}`);
	}
}
