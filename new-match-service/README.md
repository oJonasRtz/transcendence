Matchmaking & Party Service

This service implements a complete system for matchmaking, parties, invites, lobbies, and real-time communication via WebSocket for a game (e.g., Pong), supporting both RANKED and TOURNAMENT modes.

It is mainly composed of:

Server – HTTP + WebSocket API

Client – Represents a connected player

Party – Group of players

MatchMaking – Pairing system

Lobby – Manages matches and tournaments

Connection – Communication with the game server

📦 Technologies

Node.js

Fastify (HTTP)

@fastify/websocket

WebSocket (ws)

Crypto (tokens)

Events (EventEmitter)

🚀 Initialization
import { Server } from './Server.class.js';

const server = new Server();
server.listen(3020);


The server runs with HTTPS (certificates in ./ssl/server.key and ./ssl/server.cert).

🌐 HTTP Endpoints
🔹 POST /invite

Creates a party invite.

Body:

{
  "id": "user_id",
  "game_type": "RANKED" | "TOURNAMENT"
}


Response:

{
  "type": "INVITE_CREATED",
  "link": "/dashboard/play/waiting-lobby/<token>",
  "code": 200
}

🔹 POST /join_party/:token

Joins a party using an invite.

Params:

token – invite token

Body:

{
  "id": "user_id",
  "game_type": "RANKED" | "TOURNAMENT"
}


Response:

{
  "type": "JOINED_PARTY",
  "code": 200
}


If the token is invalid or expired, the user joins a solo party.

🔹 POST /leave_party

Leaves the current party.

Body:

{
  "id": "user_id"
}


Response:

{
  "type": "LEFT_PARTY",
  "code": 200
}

🔹 GET /party

Gets information about the user’s current party.

Query:

?id=user_id


Response:

{
  "type": "PARTY_INFO",
  "party": {
    "game_type": "RANKED",
    "clients": [
      { "id": "1", "name": "Alice", "rank": 120, "isLeader": true },
      { "id": "2", "name": "Bob", "rank": 115, "isLeader": false }
    ]
  },
  "code": 200
}

🔌 WebSocket API

Connection at:

wss://<host>:<port>/


All messages follow the format:

{ "type": "ACTION_TYPE", ...payload }

🔹 Client → Server Messages
Type	Payload	Description
CONNECT	{ id, name, email }	Registers the client
ENQUEUE	{ id, game_type }	Enters the matchmaking queue
DEQUEUE	{ id }	Leaves the queue
INVITE	{ id }	Requests permission to create invite
EXIT	{ id }	Disconnects
🔹 Server → Client Messages
Type	Description
CONNECTED	Successfully connected
STATE_CHANGE	State changed (IDLE, IN_QUEUE, IN_GAME)
PARTY_UPDATED	Party updated
MATCH_FOUND	Match found
MATCH_RESULT	Match result
INVITE_EXPIRED	Invite expired
ERROR	An error occurred
🧠 Client States
IDLE → IN_QUEUE → IN_GAME → IDLE


Allowed transitions:

IDLE → IN_QUEUE

IN_QUEUE → IN_GAME

IN_GAME → IDLE

👥 Party

Represents a group of players.

Main properties:

token

leader

clients

game_type (RANKED | TOURNAMENT)

state (IDLE | IN_QUEUE)

Main methods:

addClient(client, isLeader)

removeClient(client)

enqueue(caller)

dequeue()

🎯 Matchmaking

A system that attempts to form matches every 200ms.

Criteria:

Same game_type

Maximum rank difference: 100

Exact number of players:

RANKED: 2

TOURNAMENT: 4

When a match is formed:

A Lobby is created

Party promises are resolved

🏟️ Lobby

Manages the execution of a match or tournament.

Modes:
🎮 RANKED

Creates a single match

At the end:

Calculates rank

Updates XP

Sends MATCH_RESULT

🏆 TOURNAMENT

Creates brackets

Runs rounds

Manages multiple matches

🔄 Connection (Game Server)

Responsible for communication with the game server via WebSocket.

Sends:

CONNECT_LOBBY

NEW_MATCH

REMOVE_MATCH

Receives:

MATCH_CREATED

END_GAME

TIMEOUT_REMOVE

🔐 Invites

Valid while the party is in IDLE

Automatically expire if:

The leader enters the queue

The party is destroyed

Invites are relative URLs:

/dashboard/play/waiting-lobby/<token>


The frontend should complete them using:

`${window.location.origin}${link}`

❌ Common Errors
Error	Reason
INVALID_FORMAT	Invalid parameters
NOT_CONNECTED	Client not connected
PARTY_FULL	Party is full
INVITE_EXPIRED	Invalid invite
PERMISSION_DENIED	Action not allowed


✅ Best Practices

Always send id in WebSocket messages

Backend returns relative URLs

Frontend builds the full URL

Do not use global variables

📄 Example Flow

Client connects via WebSocket

Client creates an invite via POST /invite

Another player accesses /join_party/:token

Leader calls ENQUEUE

Matchmaking creates a lobby

Lobby runs the match

Result is sent to players