export function handleBallDeath(props) {
	const {match, data, player} = props;

	// player.notifyBallDeath = true;
	// if (!Object.keys(match.players).every(p => match.players[p].notifyBallDeath)) return;

	// // Reset notifyBallDeath for all players
	// Object.keys(match.players).forEach(p => {
	// 	match.players[p].notifyBallDeath = false;
	// });

	// let ball = match.ball;
	// ball.exists = false;

	// match.lastScorer = data.scorerSide;
	// Object.keys(match.players).forEach((key) => {
	// 	const p = match.players[key];

	// 	if (p.side === data.scorerSide && p.score < match.maxScore)
	// 		p.score++;
		
	// 	if (p.score >= match.maxScore) {
	// 		handleEndGame(props, p.name);
	// 		return;
	// 	}
	// });

	// console.log(`Ball death handled for match ${match.id}`);
	// console.log(`Score update: Left Player - ${match.players[1].score}, Right Player - ${match.players[2].score}`);
	match.ballDeath(data.scorerSide, player);
}
