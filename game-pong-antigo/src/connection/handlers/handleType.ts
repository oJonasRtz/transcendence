import { gameState, identity, state } from "../../globals";
import { calculateLatency } from "../utils/getLatency";

type Handler = (data: any) => void;

const map: Record<string, Handler> = {
	PING: updateState,
	PONG: () => {
		gameState.latency = calculateLatency();
		console.log(`Latency: ${gameState.latency} ms`);
	},
	PLAYER_CONNECTED: (data) => {
		const {id} = data;

		if (!id) {
			console.error("[PLAYER_CONNECTED] No id provided in data:", data);
			return;
		}
		identity.id = id;
		console.log(`[PLAYER_CONNECTED] Player connected with id: ${id}`);
	}
}

export function handleType(data: any) {
	const type: string = data.type;

	const func = map[type as keyof typeof map];
	if (!func) return;

	func(data);
}

function updateState(data: Object): void {
	try {
		console.log("Updating state with data:", data);
		const {ball, game, players} = data as any;
		
		state.ballPos.exist = ball.exists;
		state.ballPos.vector = ball.position;

		state.timer = game.time;
		state.gameStarted = game.started;
		state.gameEnd = game.ended;

		for (const [key, val] of Object.entries(players)) {
			const i: number = Number(key);

			state.players[i].name = val.name;
			state.players[i].score = val.score;
			state.players[i].up = val.direction.up;
			state.players[i].down = val.direction.down;
			
			if (i === identity.id)
				state.connection.me = val.connected;
			else
				state.connection.opponent = val.connected;
		}

		console.log("State updated to:", JSON.stringify(state, null, 2));
	} catch (error) {
		console.error("Error updating state:", error);
	}
}

//keep
	// endGame
	// startGame
	// opponentConnection
	// Ping