"use client";

import { match } from "app/ui/dashboard/MatchProvider";
import {useEffect} from "react";

/**
 * Run the Pong game on the client side.
 * @param match_id The ID of the match.
 * @param name The name of the player registered on the match.
 * @param user_id The ID of the user.
 * 
 * This must be tested after integrating with the match-service.
*/
export function Pong() {

	useEffect(() => {
		console.log("Starting Pong with match info:", match.matchInfo);
		console.log('Match ID:', match.match_id);
		const info = match.matchInfo;
		const init = async () => {
			const container = document.getElementById('pong');
			const {startPong} = await import('./pong/main');
			await startPong({
				matchId: info.match_id,
				name: info.name,
				playerId: info.user_id,
				},
				container!
			);
		};

		init();
	}, [match.match_id]);

	return (
		<div
			id="pong"
			className="rounded-lg mx-auto"
			style={{
				width: 800,
				height: 600
			 }}
		/>
	);
}
