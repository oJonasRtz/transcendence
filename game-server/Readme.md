🏓 Pong Game Server — WebSocket Engine

This service is the real-time game engine responsible for running Pong matches. It communicates with the Matchmaking & Party Service via WebSocket and manages:

Matches lifecycle

Players connections

Ball physics

Paddle movement

Game state synchronization

Score tracking

Match results

It is designed to be stateless from the frontend perspective and controlled entirely by the matchmaking backend.

🧱 Architecture Overview

This server contains the following core components:

Component	Description
Lobby	Authenticated bridge between matchmaking backend and game server
Match	Represents a running match
Player	Represents a connected player
Ball	Handles physics and scoring
Paddle	Controls paddle movement
handleTypes	Central dispatcher for WebSocket messages
ddosDetector	Basic connection abuse protection
📦 Technologies

Node.js

ws (WebSocket)

HTTPS

dotenv

Event-based architecture

Physics simulation loop

🔐 Security

Runs over WSS (TLS).

Lobby authentication uses:

LOBBY_ID

LOBBY_PASS

Includes DDoS detection based on IP rate-limiting.

🚀 Startup
1. Install dependencies
npm install

2. Configure environment

Create a .env file:

PORT=8443
LOBBY_ID=1234
LOBBY_PASS=supersecret

3. Add TLS certificates
./ssl/server.key
./ssl/server.cert

4. Start server
node index.js


Server will run at:

wss://0.0.0.0:8443

🔌 WebSocket Connection Flow

There are two types of clients:

Lobby client (matchmaking backend)

Game clients (players)

🔹 Lobby Connection
{
  "type": "CONNECT_LOBBY",
  "pass": "<LOBBY_PASS>",
  "id": "<LOBBY_ID>"
}


On success:

{
  "type": "LOBBY_CONNECTED"
}

🎮 Match Lifecycle

Lobby sends NEW_MATCH

Server creates a Match

Players connect using CONNECT_PLAYER

When all players connect → game starts

Game state updates via PING

Players send INPUT

On score → new ball

On match end → END_GAME

Lobby is notified → match is destroyed

📡 Message Protocol

All messages follow:

{
  "type": "MESSAGE_TYPE",
  ...payload,
  "timestamp": 1700000000000
}

🔁 Messages: Lobby → Game Server
Type	Payload	Description
CONNECT_LOBBY	{ pass, id }	Authenticates lobby
NEW_MATCH	{ players, maxPlayers }	Creates a new match
REMOVE_MATCH	{ matchId }	Force removes a match
🔁 Messages: Game Server → Lobby
Type	Description
LOBBY_CONNECTED	Lobby successfully authenticated
MATCH_CREATED	Match created
MATCH_REMOVED	Match destroyed
END_GAME	Match finished with full stats
ERROR	Error message
TIMEOUT_REMOVE	Match removed due to inactivity
🎯 Messages: Player → Game Server
Type	Payload	Description
CONNECT_PLAYER	{ playerId, name, matchId }	Connects a player
INPUT	{ id, up, down, matchId }	Paddle input
PING	{ id }	Client heartbeat
BOUNCE	{ axis, matchId }	Ball collision (client-assisted, optional)
END_GAME	{ matchId }	Requests match end (usually from lobby)
📤 Messages: Game Server → Player
Type	Payload	Description
CONNECT_PLAYER	{ id, matchId }	Confirms player slot
PING	{ players, ball, game }	Game state update
PONG	{}	Response to client ping
END_GAME	{}	Signals match end
ERROR	{ error }	Error occurred
🧠 Game State Format
PING Message Example:
{
  "type": "PING",
  "players": {
    "1": {
      "id": 1,
      "name": "Alice",
      "score": 3,
      "position": { "x": 50, "y": 200 },
      "size": { "width": 20, "height": 100 },
      "connected": true
    },
    "2": {
      "id": 2,
      "name": "Bob",
      "score": 5,
      "position": { "x": 750, "y": 220 },
      "size": { "width": 20, "height": 100 },
      "connected": true
    }
  },
  "ball": {
    "exists": true,
    "position": { "x": 400, "y": 300 }
  },
  "game": {
    "started": true,
    "ended": false,
    "time": "02:35"
  }
}

⏱️ Game Timer

Starts when all players connect

Stops on game end

Format: MM:SS

Timezone: America/Sao_Paulo

🏆 Scoring Rules

Each side scores when the opponent misses the ball.

Max score (default): 11

First to reach max score wins.

On each score:

Ball resets

Direction changes based on last scorer

⚙️ Physics
Ball

Speed increases after each paddle hit.

Bounce delay prevents double-collision.

Axis-based bounce: x or y.

Paddle

Speed normalized to FPS.

Movement clamped to map boundaries.

Controlled by { up: true | false, down: true | false }.

🧹 Match Cleanup

A match is destroyed when:

Game ends

Lobby sends REMOVE_MATCH

All players disconnect for a timeout period

Server restarts

❌ Error Types
Error Code	Meaning
TYPE_ERROR	Invalid message format
NOT_FOUND	Player or match not found
DUP	Duplicate connection
NOT_CONNECTED	Player not connected
PERMISSION_ERROR	Invalid lobby credentials
✅ Best Practices

Always include matchId when sending player messages.

Lobby must authenticate before managing matches.

Frontend should never connect directly to lobby socket.

Avoid client-side physics — server is authoritative.

🔄 Example Match Flow

Lobby authenticates.

Lobby sends NEW_MATCH.

Server creates match and replies MATCH_CREATED.

Players connect using CONNECT_PLAYER.

Server starts match when all players connect.

Server broadcasts PING at fixed intervals.

Players send INPUT.

Server updates state and scores.

On win → server sends END_GAME to lobby and players.

Match is destroyed.

📄 License / Ownership

This server is part of the Pong Multiplayer System and designed to integrate with the matchmaking backend. All logic is server-authoritative and compatible with tournament and ranked systems.