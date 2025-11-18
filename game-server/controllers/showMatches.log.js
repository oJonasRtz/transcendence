import { matches } from "../server.shared.js";

export function showMatches() {
	console.log(`Matches running ${Object.keys(matches)}`);
	console.log(`IDs: ${Object.values(matches).map(m => m ? m.id : null)}`);
}