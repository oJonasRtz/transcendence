# MatchMaking

# How to use
    - Connection
      - Its a websocket communication
      - how to connect:
        const socket = new WebSocket('ws://address:port');

        socket.onopen = () => {
          socket.send(JSON.stringfy({
            type: "CONNECT",
            id: string,
            email: string,
            name: string,
          }))
        }
        - All messages sent gotta be JSONs so use JSON.stringfy() before send anything to convertion, websockets only send strings
        - after send CONNECT you will recieve a confirmation via (socket.onmessage)


    - Messages
      - Every message needs identification so (type & id) is needed in every message {
        type: what this request wants the system to do
        id: who's ordering that action (user_id)
      } 
      - NOTE: every error will return this format:
      {
        type: 'ERROR',
        reason: string,
        code: 400,
      }


      - types:
      - CONNECT
        - Register client on match-service
        - body: {
          type: "CONNECT",
          id: number | string,
          email: string,
          name: string,
        }
        - return: 
          SUCCESS: {
            type: 'CONNECTED',
            code: 200
          }

      - ENQUEUE 
        - body: {
          type: "ENQUEUE",
          id: number| string,
          game_type: "RANKED" | "TOURNAMENT"
        }
        - return:
          SUCCESS:{
            type: 'STATE_CHANGE',
            state: 'IN_QUEUE'
          }
          FAIL: {
            type: 'ERROR',
            reason: 'MATCHMAKING_FAILED',
            code: 400,
          }

        - on fail the client state will return to idle state

      - DEQUEUE
        - body: {
          type: "DEQUEUE",
          id: number | string
        }
        - just return to idle state
        - return: {
          type: 'STATE_CHANGE',
          state: 'IDLE',
        }


      - EXIT
        - body: {
          type: "EXIT",
          id: number | string
        }
        - disconnects user to match-service
        - NOTE: Depending on Client state its instance will not be destroyed.
          On IN_GAME state it'll be preserver for reconnections, otherwise it'll be destroyed
        - return: no return (void)
    - Routes
      - /invite
      - /match/invite:token
      - /get_tournaments
      - /create_tournament
    - Errors

    - Flow
      - Connect via Websocket
      - Sign up sending type: CONNECT
      - 

# Planing

Planning of how it is going to work:
- Client
  - FSM (Finite State Machine)
    - Every state will trigger a behavior
    - States: IDLE, IN_QUEUE, IN_GAME
    - IDLE:
      - Only connected to the system
      - Can create invites
      - Can change to IN_QUEUE state via ENQUEUE
    - IN_QUEUE:
      - Join the MatchMaking system
      - Await to find a match
      - Can change to IDLE state via DEQUEUE
    - IN_GAME:
      - A match has been found
      - Client is in a Lobby now
      - Can't change to any other state
- MatchMaking
  - Queues: RANKED, TOURNAMENT
  - RANKED:
    - Will match 2 Clients in IN_QUEUE state
  - TOURNAMENT:
    - Will match 4 Clients in IN_QUEUE state
  - Once all Clients are found for a match:
    - Move them to a Lobby
    - All Clients change to IN_GAME state
- Lobby
  - Create a match on the game-server
  - Manages the matches while they're running
  - Update the database at the end:
    - Points
    - History
    - Disconnect all players
  - RANKED:
    - GAMES: 1
    - POINTS: Based on score difference in the game
      - 11x0: Max points
        - Winner: +30 pts
        - Loser: -25 pts
      - Ranges:
        - Win: 25–30 pts
        - Lose: 20–25 pts
  - TOURNAMENT:
    - Builds the brackets
    - GAMES: 2 (every player will play 2 games)
    - Brackets:
      - Round 1 - Opening:
        - Match 1: P1 vs. P2
        - Match 2: P3 vs. P4
      - Round 2 - Final:
        - Winners’ Final: Winner of Match 1 vs. Winner of Match 2
        - Losers’ Final: Loser of Match 1 vs. Loser of Match 2
    - Points:
      - Points by position:
        - 1st: +50 pts
        - 2nd: +25 pts
        - 3rd: -20 pts
        - 4th: -40 pts
- Server:
  - Place where all clients are connected by default
  - Manages the messages
  - Calls the routes
