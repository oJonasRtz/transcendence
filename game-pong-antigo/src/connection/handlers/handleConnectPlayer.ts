import { identity } from "../../globals";
import { keys } from "../checkKeys";
import { updateStats } from "../utils/getScore";

export function handleConnectPlayer(data: any): void {
	identity.id = data.id;
	// setPos(data.side);
	console.log(`You are player ${identity.id}`);
	updateStats(identity.id);
}
