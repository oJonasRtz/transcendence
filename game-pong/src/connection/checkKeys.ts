import { identity } from "../globals";
import type { InputType } from "../types";
import { socket } from "./connect";

export const keys: InputType = {
	id: 0,
	matchId: identity.matchId,
	type: "INPUT",
	up: false,
	down: false
};

const UPKEYS = ["ArrowUp", "w", "W"]; 
const DOWNKEYS = ["ArrowDown", "s", "S"];

function handleKey(event: KeyboardEvent, isPressed: boolean = true) {
	if (!socket) return;

	let up: boolean = UPKEYS.includes(event.key);
	let down: boolean = DOWNKEYS.includes(event.key);
	let changed: boolean = false;

	if (!isPressed) {
		up = !up && keys.up;
		down = !down && keys.down;
	}

	changed = keys.up !== up || keys.down !== down;
	keys.up = keys.up !== up ? up : keys.up;
	keys.down = keys.down !== down ? down : keys.down; 

	if (changed && socket.readyState === socket.OPEN && identity.id)
		socket.send(JSON.stringify(keys));
}

export function checkKeys(socket: WebSocket | null): void {
	if (!socket) return;

	window.addEventListener("keydown", (event) => {
		handleKey(event);
	});

	window.addEventListener("keyup", (event) => {
		handleKey(event, false);
	});
}
