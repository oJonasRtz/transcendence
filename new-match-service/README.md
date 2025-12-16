# MatchMaking

Planing of how it gonna works
	-> Client
		-> FSM(Finite State Machine)
			- every state will trigger a behavior
			- states [IDLE, IN_QUEUE, IN_GAME]
			-> IDLE
				- Only connected to the system
				- Can create invites
				- Can change to IN_QUEUE state via ENQUEUE
			-> IN_QUEUE
				- join the MatchMaking system
				- Await to find a match
				- Chan change to IDLE state via DEQUEUE
			-> IN_GAME
				- A Match has been found
				- Client is in a Lobby now
				- Can't change to any other state
	-> MatchMaking
		- Queues[RANKED, TOURNAMENT]
		-> RANKED
			- Will match 2 Clients in IN_QUEUE state
		-> TOURNAMENT
			- will match 4 Clients in IN_QUEUE state
		-> once all Clients are found for a match
			- Move then for a Lobby
			- All Clients change to IN_GAME state
	-> Lobby
		- Create a match on the game-server
		- Manages the matches while their running
		- Update the database at the end
			- Points
			- history
			- Disconnect all players
		-> RANKED
			- GAMES: 1
			-> POINTS: bases on score diff in the game
				- 11x0: Max points
					- Winner: +30 pts
					- Loser: -25pts
				-> Ranges
					Win: 25 - 30 pts
					lose: 20 - 25 pts
		-> TOURNAMENT
			- Will build the brackets
			- GAMES: 2 (every player will play 2 games)
			-> Brackets
				- Round 1 - opening
					Match 1: P1 x P2
					Match 2: P3 x P4
				- Round 2 - Final
					- Winners Final: winner M1 x winner M2
					- Losers Final: loser M1 x loser M2
			-> Points
				-> pontuatin by position
					- 1st: +50 pts
					- 2nd: +25 pts
					- 3rd: -20 pts
					- 4th: -40 pts
		-> Server
			- Place where all clients are connected by default
			- Manages the messages
			- Call the routes