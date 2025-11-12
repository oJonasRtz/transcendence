import { disconnectPlayer, socket } from "../connect";

export function handleEndGame(data: any): void {
	if (!socket) return;

	console.log(`[handleEndGame] Sending endGame notification: ${data}`);
	disconnectPlayer("Game ended");
}
