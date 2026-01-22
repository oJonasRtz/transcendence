"use client";

import {useEffect} from "react";

/**
 * Run the Pong game on the client side.
 * @param match_id The ID of the match.
 * @param name The name of the player registered on the match.
 * @param user_id The ID of the user.
 * 
 * This must be tested after integrating with the match-service.
*/
export function Pong({match_id, name, user_id}: {match_id: number, name: string, user_id: string}) {

	useEffect(() => {
		const init = async () => {
			const container = document.getElementById('pong');
			const {startPong} = await import('./pong/main');
			await startPong({
				matchId: match_id,
				name: name,
				playerId: user_id,
				},
				container!
			);
		};
		init();
	}, [match_id, name, user_id]);

	return (
		<div
			id="pong"
			className="w-full h-full aspect-video rounded-lg"
			style={{ minHeight: 600 }}
		/>
	);
}
