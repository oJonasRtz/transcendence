import { broadcast } from "../utils/broadcast.js";

const START_DELAY = 1000;

//Returns 1 or -1 randomly
export function getRandomDir() {
	const val = Math.random();

	return (val < 0.5) - (val >= 0.5);
}

export function handleNewBall(props) {
	// const {match, player} = props;
	// const now = Date.now();
	// const timeToStart = now + START_DELAY;
	// let ball = match.ball;


	// ball.exists = true;

	// if (!match.lastScorer) {
	// 	ball.direction.x = getRandomDir();
	// 	ball.direction.y = getRandomDir();
	// }
	// else {
	// 	ball.direction.x = props.match.lastScorer === "left" ? -1 : 1;
	// 	ball.direction.y = getRandomDir();
	// }

	// console.log(`New ball created for match ${match.id}`);

	// broadcast({type: "newBall", direction: ball.direction, startTime: timeToStart}, player.matchIndex);

	const {match} = props;

	match.newBall();
}
