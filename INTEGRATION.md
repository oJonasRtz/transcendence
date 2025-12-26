# Frontend-Backend Integration Guide

> **Transcendence Gaming Platform**
> Comprehensive guide for integrating the Next.js frontend with backend microservices

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Gateway Integration](#api-gateway-integration)
5. [WebSocket Connections](#websocket-connections)
6. [Environment Configuration](#environment-configuration)
7. [API Client Implementation](#api-client-implementation)
8. [Error Handling](#error-handling)
9. [Security Considerations](#security-considerations)
10. [Development Workflow](#development-workflow)
11. [Common Integration Scenarios](#common-integration-scenarios)
12. [API Reference](#api-reference)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide documents how to connect the Next.js 16 frontend with the existing backend microservices architecture. The backend consists of 9 microservices orchestrated via Docker Compose, using Fastify, Socket.io, and WebSockets.

### Prerequisites

- Node.js 20+
- pnpm (for Next.js frontend)
- Docker & Docker Compose
- Basic understanding of JWT authentication
- Familiarity with WebSockets and Socket.io

### Key Principles

- **All HTTP API calls** go through the api-gateway (port 3000)
- **Authentication** uses JWT tokens stored in httpOnly cookies
- **Real-time features** use Socket.io (chat) and native WebSocket (games, matchmaking)
- **Both frontends coexist**: Next.js and existing EJS templates run side-by-side

---

## Architecture Overview

### Service Map

| Service | Port(s) | Technology | Purpose |
|---------|---------|------------|---------|
| **nginx** | 80, 443 | Nginx Alpine | Reverse proxy, SSL termination |
| **api-gateway** | 3000 | Fastify + Socket.IO | Main entry point, routing, sessions |
| **auth-service** | 3001 | Fastify | JWT generation, 2FA, auth logic |
| **sqlite-db** | 3002 | Fastify + SQLite3 | Database layer |
| **users-service** | 3003 | Fastify | User profiles, status, friends |
| **chat-service** | 3005 | Fastify | Message storage |
| **game-server** | 8443 | Native WebSocket | Pong game server |
| **match-service** | 3004, 3010, 3020 | Fastify + WebSocket | Matchmaking system |
| **game-pong** | 3005 | Nginx (static) | Pong game client (TypeScript SPA) |
| **game-flappy-bird** | 3006 | Nginx (static) | Flappy Bird game client (TypeScript SPA) |

### Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS/WSS
                 ▼
┌────────────────────────────────────────────────────────────┐
│                    NGINX (Port 443)                         │
│  Routes: /, /socket.io/, /pong-server/, /grafana/         │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│              API-GATEWAY (Port 3000)                        │
│  - JWT Authentication (authHook, require2faHook)           │
│  - Socket.IO Server (chat, notifications)                  │
│  - Session Management                                       │
└─────┬──────┬──────┬──────┬──────────────────────────────┘
      │      │      │      │
      ▼      ▼      ▼      ▼
   ┌────┐ ┌────┐ ┌────┐ ┌────────┐
   │AUTH│ │USER│ │CHAT│ │  MATCH │
   │3001│ │3003│ │3005│ │  3004  │
   └──┬─┘ └──┬─┘ └──┬─┘ └────┬───┘
      │      │      │         │
      └──────┴──────┴─────────▼
              ┌──────────────┐
              │ SQLITE-DB    │
              │  (3002)      │
              └──────────────┘

┌────────────────────────────────────────────────────────────┐
│              GAME SERVER (WebSocket 8443)                   │
│  - Native WebSocket                                         │
│  - Pong game logic                                          │
└────────────────────────────────────────────────────────────┘
```

### Docker Networks

- **transcendence** (172.28.0.0/16): Main application network
- **game** (172.29.0.0/16): Game-related services
- **db_connection**: Database isolation layer

### Request Flow

```
1. Client Request
   ↓
2. Nginx (SSL termination, routing)
   ↓
3. API-Gateway (JWT validation, session management)
   ↓
4. Microservice (auth, users, chat, etc.)
   ↓
5. Database Layer (sqlite-db)
   ↓
6. Response back through chain
```

---

## Authentication & Authorization

### JWT Authentication

The platform uses **JSON Web Tokens (JWT)** stored in httpOnly cookies for authentication.

#### Token Creation

When a user logs in successfully, the auth-service creates a JWT:

```javascript
// auth-service/controllers/authControllers.js
const payload = {
  username: "john_doe",
  user_id: 123,
  email: "john@example.com",
  public_id: "abc123xyz"
};

const token = jwt.sign(payload, process.env.JWT_SECRET || "purpleVoid", {
  expiresIn: process.env.JWT_EXPIRES_IN || "1h"
});
```

**Token Payload:**
- `username` - User's username
- `user_id` - Internal database ID
- `email` - User's email address
- `public_id` - Public-facing user identifier (used for URLs, sharing)

**Token Settings:**
- **Secret**: `JWT_SECRET` environment variable (default: "purpleVoid")
- **Expiration**: 1 hour (default)
- **Algorithm**: HS256

#### Token Storage

Tokens are stored in httpOnly cookies for security:

```javascript
// api-gateway sets cookie after successful login
reply.setCookie("jwt", token, {
  httpOnly: true,        // Prevents JavaScript access (XSS protection)
  secure: true,          // HTTPS only in production
  sameSite: "strict",    // CSRF protection
  path: "/",
  maxAge: 60 * 60 * 1000 // 1 hour
});
```

**Security Features:**
- ✅ `httpOnly: true` - No client-side JavaScript access
- ✅ `sameSite: 'strict'` - Prevents CSRF attacks
- ✅ `secure: true` - HTTPS-only transmission (production)
- ✅ `path: "/"` - Available to all routes

#### Authentication Middleware

The api-gateway uses authentication hooks to protect routes:

```javascript
// api-gateway/hooks/hooks.js
export async function authHook(req, reply) {
  const token = req.cookies?.jwt;

  if (!token) {
    return reply.redirect("/login");
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.jwt = token;        // Original token
    req.user = data;        // Decoded payload: {username, user_id, email, public_id}
    req.user.isOnline = true;

    // Set user online status
    await axios.post("http://users-service:3003/setIsOnline", {
      user_id: data.user_id,
      isOnline: true
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      await req.session.destroy();
      reply.clearCookie("jwt");
      reply.clearCookie("session");
      return reply.redirect("/login");
    }
    throw err;
  }
}
```

**Applied to Routes:**

```javascript
// Public routes (no auth required)
app.register(publicRoutes, {});

// Private routes (auth + 2FA required)
app.register(async (privateScope) => {
  privateScope.addHook('preHandler', authHook);        // Validate JWT
  privateScope.addHook('preHandler', require2faHook);  // Check 2FA
  privateScope.register(privateRoutes, {});
});
```

### Two-Factor Authentication (2FA)

**Implementation**: TOTP-based using Speakeasy library

**2FA Flow:**

```
1. User enables 2FA in settings
   ↓
2. System generates secret (speakeasy.generateSecret())
   ↓
3. QR code created for authenticator apps (Google Auth, Authy)
   ↓
4. User scans QR code
   ↓
5. Secret stored in database
   ↓
6. On subsequent logins:
   - User provides username/password → JWT issued
   - 2FA hook checks if 2FA is enabled
   - If enabled and not validated → redirect to /check2FAQrCode
   - User enters TOTP code
   - System validates code → access granted
```

**2FA Middleware:**

```javascript
// api-gateway/hooks/hooks.js
export async function require2faHook(req, reply) {
  const token = req.cookies?.jwt;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if 2FA is enabled for this user
  const twoFactorEnable = await axios.post(
    "http://auth-service:3001/get2FAEnable",
    { email: decoded.email }
  );

  if (twoFactorEnable?.data.twoFactorEnable) {
    // Check if 2FA token has been validated
    const twoFactorValidate = await axios.post(
      "http://auth-service:3001/get2FAValidate",
      { email: decoded.email }
    );

    if (!twoFactorValidate?.data.twoFactorValidate) {
      return reply.redirect("/check2FAQrCode");
    }
  }
}
```

### Session Management

In addition to JWT, the api-gateway uses sessions for temporary data:

```javascript
// api-gateway/app.js
app.register(session, {
  secret: process.env.SESSION_SECRET || 'purpleVoidSatoroGojopurpleVoidSatoroGojo',
  cookieName: "session",
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: isProduction
  },
  saveUninitialized: false
});
```

**Session Uses:**
- CAPTCHA codes and expiration times
- Email verification workflows
- Success/error messages
- 2FA validation state

---

## API Gateway Integration

### Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com` (via nginx on port 443)

### Public Routes (No Authentication Required)

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| GET | `/` | Landing page | - |
| GET | `/login` | Login page | - |
| POST | `/checkLogin` | Validate login | `{username, password, captcha}` |
| GET | `/register` | Registration page | - |
| POST | `/checkRegister` | Validate registration | `{username, email, password, nickname}` |
| GET | `/forgotPassword` | Password recovery page | - |
| POST | `/checkEmail` | Send recovery email | `{email}` |
| GET | `/validateEmailCode` | Email verification page | `?code=xxx` |
| POST | `/checkEmailCode` | Validate email code | `{code}` |
| GET | `/changePassword` | Password reset page | - |
| POST | `/newPassword` | Set new password | `{password, confirmPassword}` |
| GET | `/favicon.ico` | Favicon | - |

### Private Routes (JWT + 2FA Required)

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| GET | `/home` | User homepage | - |
| GET | `/logout` | Logout user | - |
| POST | `/upload` | Upload avatar | `FormData: {file}` |
| GET | `/changeUsername` | Username change page | - |
| POST | `/setAuthUsername` | Update username | `{username}` |
| GET | `/changeNickname` | Nickname change page | - |
| POST | `/setAuthNickname` | Update nickname | `{nickname}` |
| GET | `/changeEmail` | Email change page | - |
| POST | `/setAuthEmail` | Update email | `{email}` |
| GET | `/changeYourPassword` | Password change page | - |
| POST | `/setAuthPassword` | Update password | `{currentPassword, newPassword}` |
| GET | `/changeDescription` | Bio change page | - |
| POST | `/setUserDescription` | Update bio | `{description}` |
| GET | `/match` | Matchmaking page | - |
| POST | `/match/join` | Join queue | `{queueType: "RANKED" \| "TOURNAMENT"}` |
| POST | `/match/leave` | Leave queue | - |
| GET | `/seeAllUsers` | Browse users | - |
| GET | `/seeProfile` | View profile | `?public_id=xxx` |
| GET | `/chatAllUsers` | Public chat page | - |
| GET | `/directMessage` | Private chat page | `?public_id=xxx` |
| POST | `/friendInvite` | Send friend request | `{friendPublicId}` |
| POST | `/setAcceptFriend` | Accept friend request | `{friendshipId}` |
| POST | `/deleteAFriend` | Remove friend | `{friendPublicId}` |
| POST | `/blockTheUser` | Block user | `{targetPublicId}` |
| GET | `/flappy-bird` | Flappy Bird game | - |
| GET | `/pong` | Pong game | - |
| GET | `/handlerFriendsPage` | Friends management | - |
| GET | `/confirmUserEmail` | Email confirm page | - |
| POST | `/validateUserEmailCode` | Validate email | `{code}` |
| GET | `/get2FAQrCode` | Get 2FA QR code | - |
| GET | `/check2FAQrCode` | 2FA validation page | - |
| POST | `/validate2FAQrCode` | Validate 2FA code | `{token}` |
| GET | `/set2FAOnOff` | Toggle 2FA | `?enable=true\|false` |
| GET | `/deleteUserAccount` | Account deletion | - |

### Making Authenticated Requests (TypeScript)

```typescript
// lib/api/client.ts
class APIClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000") {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // CRITICAL: Sends cookies with request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // JWT expired or invalid - redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (response.redirected) {
      // Server redirected (likely to 2FA or login)
      window.location.href = response.url;
      throw new Error('Redirected');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient();
```

**Usage Example:**

```typescript
// app/actions/auth.ts
'use server'

export async function login(username: string, password: string, captcha: string) {
  const response = await apiClient.post('/checkLogin', {
    username,
    password,
    captcha
  });
  return response;
}

export async function updateUsername(newUsername: string) {
  const response = await apiClient.post('/setAuthUsername', {
    username: newUsername
  });
  return response;
}

export async function getUserProfile(publicId: string) {
  const response = await apiClient.get(`/seeProfile?public_id=${publicId}`);
  return response;
}
```

### File Upload (Avatar)

```typescript
// lib/api/users.ts
export async function uploadAvatar(file: File): Promise<{success: boolean, avatarUrl: string}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/upload`, {
    method: 'POST',
    credentials: 'include', // Send JWT cookie
    body: formData, // Don't set Content-Type - browser sets it with boundary
  });

  if (!response.ok) {
    throw new Error('Avatar upload failed');
  }

  return response.json();
}
```

---

## WebSocket Connections

### Socket.io (Chat & Real-time Updates)

**URL**: `ws://localhost/socket.io/` (development) or `wss://yourdomain.com/socket.io/` (production)

**Authentication**: Automatic via cookies (JWT sent with WebSocket handshake)

#### Connection Setup (React/Next.js)

```typescript
// lib/socket/chat.ts
'use client'

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectToChat(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const url = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost';

  socket = io(url, {
    transports: ['websocket'],
    withCredentials: true, // CRITICAL: Sends cookies (JWT)
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Connected to chat server');
    socket?.emit('join'); // Join public chat
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    if (error.message.includes('JWT')) {
      // JWT invalid or expired - redirect to login
      window.location.href = '/login';
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });

  return socket;
}

export function disconnectFromChat() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
```

#### Client → Server Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `join` | - | Join public chat room |
| `joinPrivate` | `{target_id: string}` | Join private chat with user |
| `sendMessage` | `string` (max 200 chars) | Send public message |
| `sendPrivateMessage` | `(message: string, public_id: string)` | Send private message |
| `sendInvite` | - | Send public game invitation link |
| `sendPrivateInvite` | `string` (target_id) | Send private game invitation |

#### Server → Client Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `updateUsers` | `Array<{name: string, public_id: string}>` | Active users list |
| `updateMessages` | `Array<Message>` | Public chat messages |
| `updateDirectMessages` | `Array<Message>` | Private chat messages |
| `updatePrivateUsers` | `Array<{name: string, public_id: string}>` | Private chat participants |

**Message Type:**

```typescript
interface Message {
  username: string;
  avatar: string;
  msg: string;
  isSystem: boolean;
  isLink: boolean;      // True if msg contains game invitation link
  isLimit?: boolean;    // True if rate limit error
}
```

#### Usage Example (React Component)

```typescript
'use client'

import { useEffect, useState } from 'react';
import { connectToChat, getSocket } from '@/lib/socket/chat';

interface User {
  name: string;
  public_id: string;
}

interface Message {
  username: string;
  avatar: string;
  msg: string;
  isSystem: boolean;
  isLink: boolean;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const socket = connectToChat();

    socket.on('updateMessages', (newMessages: Message[]) => {
      setMessages(newMessages);
    });

    socket.on('updateUsers', (activeUsers: User[]) => {
      setUsers(activeUsers);
    });

    return () => {
      socket.off('updateMessages');
      socket.off('updateUsers');
    };
  }, []);

  const sendMessage = () => {
    const socket = getSocket();
    if (socket && inputMessage.trim()) {
      socket.emit('sendMessage', inputMessage);
      setInputMessage('');
    }
  };

  const sendGameInvite = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('sendInvite');
    }
  };

  return (
    <div>
      <div className="users">
        <h3>Online Users ({users.length})</h3>
        <ul>
          {users.map((user) => (
            <li key={user.public_id}>{user.name}</li>
          ))}
        </ul>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.isSystem ? 'system-message' : 'user-message'}>
            {!msg.isSystem && <img src={msg.avatar} alt={msg.username} />}
            <span>{msg.username}: </span>
            {msg.isLink ? (
              <a href={msg.msg} target="_blank">Join Game</a>
            ) : (
              <span>{msg.msg}</span>
            )}
          </div>
        ))}
      </div>

      <div className="input">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          maxLength={200}
          placeholder="Type a message (max 200 chars)..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={sendGameInvite}>Invite to Game</button>
      </div>
    </div>
  );
}
```

### Match Service WebSocket (Matchmaking)

**URL**: `ws://localhost:3020` (development)

**Protocol**: Custom FSM (Finite State Machine)

**Authentication**: Requires email, id, and name in CONNECT message

#### Client States

```
IDLE → (ENQUEUE) → IN_QUEUE → (MATCH_FOUND) → IN_GAME
  ↑                    ↓
  └────(DEQUEUE)───────┘
```

#### Message Types

| Type | Direction | Payload | Purpose |
|------|-----------|---------|---------|
| `CONNECT` | Client → Server | `{email: string, id: number, name: string}` | Register client |
| `ENQUEUE` | Client → Server | `{queue_type: "RANKED" \| "TOURNAMENT"}` | Join matchmaking |
| `DEQUEUE` | Client → Server | - | Leave queue |
| `EXIT` | Client → Server | - | Disconnect |
| `MATCH_FOUND` | Server → Client | `{matchId: string, gameServerUrl: string}` | Match ready |
| `QUEUE_UPDATE` | Server → Client | `{position: number, queueSize: number}` | Queue status |

#### TypeScript Implementation

```typescript
// lib/socket/matchmaking.ts
'use client'

export type QueueType = 'RANKED' | 'TOURNAMENT';

export enum ClientState {
  IDLE = 'IDLE',
  IN_QUEUE = 'IN_QUEUE',
  IN_GAME = 'IN_GAME',
}

interface MatchFoundPayload {
  matchId: string;
  gameServerUrl: string;
  players: string[];
}

export class MatchmakingClient {
  private ws: WebSocket | null = null;
  private state: ClientState = ClientState.IDLE;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private url: string = process.env.NEXT_PUBLIC_MATCH_SERVICE_WS || 'ws://localhost:3020',
    private onMatchFound?: (payload: MatchFoundPayload) => void,
    private onStateChange?: (state: ClientState) => void
  ) {}

  connect(email: string, id: number, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Connected to match service');
        this.send('CONNECT', { email, id, name });
        this.setState(ClientState.IDLE);
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from match service');
        this.handleReconnect(email, id, name);
      };
    });
  }

  enqueue(queueType: QueueType) {
    if (this.state !== ClientState.IDLE) {
      throw new Error('Must be in IDLE state to enqueue');
    }
    this.send('ENQUEUE', { queue_type: queueType });
    this.setState(ClientState.IN_QUEUE);
  }

  dequeue() {
    if (this.state !== ClientState.IN_QUEUE) {
      throw new Error('Must be in IN_QUEUE state to dequeue');
    }
    this.send('DEQUEUE', {});
    this.setState(ClientState.IDLE);
  }

  disconnect() {
    this.send('EXIT', {});
    this.ws?.close();
    this.ws = null;
    this.setState(ClientState.IDLE);
  }

  private send(type: string, data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    this.ws.send(JSON.stringify({ type, ...data }));
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'MATCH_FOUND':
        this.setState(ClientState.IN_GAME);
        this.onMatchFound?.(message);
        break;
      case 'QUEUE_UPDATE':
        console.log(`Queue position: ${message.position}/${message.queueSize}`);
        break;
      case 'ERROR':
        console.error('Match service error:', message.error);
        break;
    }
  }

  private setState(newState: ClientState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  private handleReconnect(email: string, id: number, name: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(email, id, name), delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  getState(): ClientState {
    return this.state;
  }
}
```

#### Usage Example (React)

```typescript
'use client'

import { useState, useEffect } from 'react';
import { MatchmakingClient, ClientState, QueueType } from '@/lib/socket/matchmaking';

export default function MatchmakingPage() {
  const [client, setClient] = useState<MatchmakingClient | null>(null);
  const [state, setState] = useState<ClientState>(ClientState.IDLE);
  const [matchUrl, setMatchUrl] = useState<string | null>(null);

  useEffect(() => {
    // Assume you have user data from JWT or session
    const user = { email: 'user@example.com', id: 123, name: 'JohnDoe' };

    const matchClient = new MatchmakingClient(
      undefined,
      (payload) => {
        // Match found callback
        console.log('Match found!', payload);
        setMatchUrl(payload.gameServerUrl);
      },
      (newState) => {
        // State change callback
        setState(newState);
      }
    );

    matchClient.connect(user.email, user.id, user.name)
      .catch(console.error);

    setClient(matchClient);

    return () => {
      matchClient.disconnect();
    };
  }, []);

  const joinRanked = () => {
    client?.enqueue('RANKED');
  };

  const joinTournament = () => {
    client?.enqueue('TOURNAMENT');
  };

  const leaveQueue = () => {
    client?.dequeue();
  };

  return (
    <div>
      <h1>Matchmaking</h1>
      <p>Current State: {state}</p>

      {state === ClientState.IDLE && (
        <div>
          <button onClick={joinRanked}>Join Ranked Queue</button>
          <button onClick={joinTournament}>Join Tournament Queue</button>
        </div>
      )}

      {state === ClientState.IN_QUEUE && (
        <div>
          <p>Searching for match...</p>
          <button onClick={leaveQueue}>Leave Queue</button>
        </div>
      )}

      {state === ClientState.IN_GAME && matchUrl && (
        <div>
          <p>Match found!</p>
          <a href={matchUrl} target="_blank">Join Game</a>
        </div>
      )}
    </div>
  );
}
```

### Game Server WebSocket (Pong)

**URL**: `wss://localhost/pong-server/` (via nginx proxy)

**Protocol**: Native WebSocket

**Features**:
- DDoS protection (rate limiting by IP)
- Lobby system for match coordination
- Real-time game state synchronization

**Note**: Game server connection is typically initiated from the game client (game-pong), not directly from Next.js. The match service provides the game server URL when a match is found.

---

## Environment Configuration

### Frontend (.env.local)

Create a `.env.local` file in the `frontend/` directory:

```bash
# API Gateway
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
# For production:
# NEXT_PUBLIC_API_GATEWAY_URL=https://yourdomain.com

# WebSocket Endpoints
NEXT_PUBLIC_SOCKET_IO_URL=http://localhost
NEXT_PUBLIC_MATCH_SERVICE_WS=ws://localhost:3020

# Database (for existing Prisma setup)
DATABASE_URL=postgresql://user:password@localhost:5432/transcendence

# NextAuth (if using)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3001
```

### Backend Environment Variables

#### Root `.env`

```bash
# Grafana
GRAFANA_ADMIN_PASSWORD=your-secure-password-here
```

#### `match-service/.env`

```bash
PORT=3004
```

#### Required Variables (set in Docker or .env files)

```bash
# JWT Configuration
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRES_IN=1h

# Session Configuration
SESSION_SECRET=your-session-secret-here

# Service Ports (defaults in code)
AUTH_SERVICE_PORT=3001
USERS_SERVICE_PORT=3003
CHAT_SERVICE_PORT=3005
SQLITE_DB_PORT=3002
```

### Environment Variable Checklist

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `JWT_SECRET` | ⚠️ Yes | "purpleVoid" | JWT signing secret |
| `JWT_EXPIRES_IN` | No | "1h" | Token expiration |
| `SESSION_SECRET` | ⚠️ Yes | Long string | Session encryption |
| `NEXT_PUBLIC_API_GATEWAY_URL` | Yes | "http://localhost:3000" | Frontend → backend |
| `NEXT_PUBLIC_SOCKET_IO_URL` | Yes | "http://localhost" | WebSocket endpoint |
| `NEXT_PUBLIC_MATCH_SERVICE_WS` | Yes | "ws://localhost:3020" | Match service |
| `DATABASE_URL` | Yes | - | PostgreSQL connection |

⚠️ **Security Warning**: Never use default secrets in production. Always set strong, unique values for `JWT_SECRET` and `SESSION_SECRET`.

---

## API Client Implementation

### Base HTTP Client

```typescript
// lib/api/client.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `HTTP ${status}: ${statusText}`);
    this.name = 'APIError';
  }
}

export class APIClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Send cookies (JWT)
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle redirects (login, 2FA)
    if (response.redirected) {
      if (typeof window !== 'undefined') {
        window.location.href = response.url;
      }
      throw new APIError(302, 'Redirected', response.url);
    }

    // Handle errors
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new APIError(response.status, response.statusText);
    }

    // Parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type - browser sets it with boundary
    });

    if (!response.ok) {
      throw new APIError(response.status, response.statusText);
    }

    return response.json();
  }
}

export const apiClient = new APIClient();
```

### Authentication API

```typescript
// lib/api/auth.ts
import { apiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
  captcha: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export const authAPI = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/checkLogin', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/checkRegister', data);
  },

  async logout(): Promise<void> {
    return apiClient.get('/logout');
  },

  async forgotPassword(email: string): Promise<{success: boolean}> {
    return apiClient.post('/checkEmail', { email });
  },

  async resetPassword(password: string, confirmPassword: string): Promise<{success: boolean}> {
    return apiClient.post('/newPassword', { password, confirmPassword });
  },

  async validate2FA(token: string): Promise<{success: boolean}> {
    return apiClient.post('/validate2FAQrCode', { token });
  },

  async toggle2FA(enable: boolean): Promise<{success: boolean}> {
    return apiClient.get(`/set2FAOnOff?enable=${enable}`);
  },
};
```

### User API

```typescript
// lib/api/users.ts
import { apiClient } from './client';

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  nickname: string;
  public_id: string;
  avatar: string;
  description: string;
  rank: number;
  wins: number;
  losses: number;
  experience: number;
  isOnline: boolean;
  inGame: boolean;
}

export const usersAPI = {
  async getProfile(publicId: string): Promise<UserProfile> {
    return apiClient.get(`/seeProfile?public_id=${publicId}`);
  },

  async getAllUsers(): Promise<UserProfile[]> {
    return apiClient.get('/seeAllUsers');
  },

  async updateUsername(username: string): Promise<{success: boolean}> {
    return apiClient.post('/setAuthUsername', { username });
  },

  async updateNickname(nickname: string): Promise<{success: boolean}> {
    return apiClient.post('/setAuthNickname', { nickname });
  },

  async updateEmail(email: string): Promise<{success: boolean}> {
    return apiClient.post('/setAuthEmail', { email });
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<{success: boolean}> {
    return apiClient.post('/setAuthPassword', { currentPassword, newPassword });
  },

  async updateDescription(description: string): Promise<{success: boolean}> {
    return apiClient.post('/setUserDescription', { description });
  },

  async uploadAvatar(file: File): Promise<{success: boolean, avatarUrl: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData('/upload', formData);
  },

  async deleteAccount(): Promise<{success: boolean}> {
    return apiClient.get('/deleteUserAccount');
  },
};
```

### Friends API

```typescript
// lib/api/friends.ts
import { apiClient } from './client';

export interface Friendship {
  id: number;
  owner_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export const friendsAPI = {
  async sendFriendRequest(friendPublicId: string): Promise<{success: boolean}> {
    return apiClient.post('/friendInvite', { friendPublicId });
  },

  async acceptFriendRequest(friendshipId: number): Promise<{success: boolean}> {
    return apiClient.post('/setAcceptFriend', { friendshipId });
  },

  async removeFriend(friendPublicId: string): Promise<{success: boolean}> {
    return apiClient.post('/deleteAFriend', { friendPublicId });
  },

  async blockUser(targetPublicId: string): Promise<{success: boolean}> {
    return apiClient.post('/blockTheUser', { targetPublicId });
  },

  async getFriendsList(): Promise<Friendship[]> {
    return apiClient.get('/handlerFriendsPage');
  },
};
```

### Match API

```typescript
// lib/api/match.ts
import { apiClient } from './client';

export type QueueType = 'RANKED' | 'TOURNAMENT';

export interface MatchInfo {
  matchId: string;
  queueType: QueueType;
  status: 'waiting' | 'in_progress' | 'completed';
  players: string[];
}

export const matchAPI = {
  async joinQueue(queueType: QueueType): Promise<{success: boolean}> {
    return apiClient.post('/match/join', { queueType });
  },

  async leaveQueue(): Promise<{success: boolean}> {
    return apiClient.post('/match/leave');
  },

  async createInvite(publicId?: string): Promise<{link: string}> {
    // This calls match-service via api-gateway Socket.io
    // Implementation depends on your socket setup
    throw new Error('Use Socket.io sendInvite or sendPrivateInvite event');
  },
};
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 302 | Redirect | Follow redirect (login, 2FA) |
| 400 | Bad Request | Validation error, check input |
| 401 | Unauthorized | JWT expired/invalid → redirect to login |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded, retry later |
| 500 | Internal Server Error | Server error, contact support |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}
```

### Error Handling Best Practices

```typescript
// Example: Login with error handling
async function handleLogin(username: string, password: string, captcha: string) {
  try {
    const response = await authAPI.login({ username, password, captcha });

    if (response.success) {
      // Success - JWT cookie is automatically set
      window.location.href = '/home';
    } else {
      // Server returned error message
      showError(response.message || 'Login failed');
    }
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.status) {
        case 401:
          showError('Invalid credentials');
          break;
        case 429:
          showError('Too many attempts. Please try again later.');
          break;
        default:
          showError(`Error: ${error.statusText}`);
      }
    } else {
      showError('Network error. Please check your connection.');
    }
  }
}
```

### WebSocket Error Handling

```typescript
// Socket.io connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);

  if (error.message.includes('JWT')) {
    // JWT authentication failed
    window.location.href = '/login';
  } else if (error.message.includes('timeout')) {
    // Connection timeout - retry
    setTimeout(() => socket.connect(), 5000);
  } else {
    // Other errors
    showError('Failed to connect to chat server');
  }
});

// Match service WebSocket errors
matchClient.on('error', (error) => {
  console.error('Match service error:', error);

  if (error.code === 'AUTH_FAILED') {
    window.location.href = '/login';
  } else if (error.code === 'QUEUE_FULL') {
    showError('Matchmaking queue is full. Please try again later.');
  }
});
```

---

## Security Considerations

### Cookie Security

✅ **Enabled:**
- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `sameSite: 'strict'` - Prevents CSRF attacks
- `secure: true` - HTTPS-only in production
- Short expiration (1 hour)

⚠️ **Ensure:**
- Always use `credentials: 'include'` in fetch requests
- Never store JWT in localStorage or sessionStorage
- Never expose JWT in URL parameters

### CORS Configuration

The nginx proxy handles CORS:

```nginx
add_header Access-Control-Allow-Origin $http_origin;
add_header Access-Control-Allow-Credentials true;
```

**Important**: In production, restrict origins to your domain:

```nginx
# Instead of reflecting $http_origin, use specific domain
add_header Access-Control-Allow-Origin https://yourdomain.com;
```

### Input Validation

**Client-side** (Next.js):
- Validate all user input before sending
- Sanitize HTML to prevent XSS
- Limit message length (200 chars for chat)

**Server-side** (api-gateway hooks):
- Email format validation
- Password strength requirements (8+ chars, complexity)
- Username validation (no profanity)
- CAPTCHA verification

### Rate Limiting

- CAPTCHA on login/register prevents bots
- Game invitation links have time-based restrictions
- Chat messages limited to 200 characters
- WebSocket connections have DDoS protection

### Environment Variables

⚠️ **Never commit:**
- `.env` files
- `JWT_SECRET` values
- Database credentials
- API keys

✅ **Use:**
- `.env.example` templates
- Environment-specific secrets
- Docker secrets in production

---

## Development Workflow

### Starting the Backend

```bash
# From project root
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api-gateway
docker-compose logs -f match-service

# Stop services
docker-compose down
```

### Starting the Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

### Testing API Calls Locally

```bash
# Test public endpoint (no auth)
curl http://localhost:3000/

# Test login (get JWT cookie)
curl -X POST http://localhost:3000/checkLogin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","captcha":"abc123"}' \
  -c cookies.txt

# Test private endpoint (use JWT cookie)
curl http://localhost:3000/home \
  -b cookies.txt

# Test avatar upload
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@avatar.jpg" \
  -b cookies.txt
```

### Debugging Authentication

**Check JWT cookie in browser:**
1. Open DevTools → Application → Cookies
2. Find `jwt` cookie
3. Decode at [jwt.io](https://jwt.io) to inspect payload

**Check WebSocket connection:**
1. Open DevTools → Network → WS
2. Filter by `socket.io` or match service URL
3. Inspect frames for messages

**Common Issues:**
- ❌ 401 Unauthorized → JWT expired or invalid
- ❌ Cookie not sent → Missing `credentials: 'include'`
- ❌ CORS error → Origin not allowed
- ❌ WebSocket connection refused → Service not running

### Monitoring with Grafana

Access Grafana dashboard:
1. Navigate to `https://localhost/grafana/`
2. Login with admin credentials (set in `.env`)
3. View dashboards for:
   - Service health
   - Request rates
   - Error rates
   - Container metrics

---

## Common Integration Scenarios

### 1. User Registration Flow

```typescript
'use client'

import { useState } from 'react';
import { authAPI } from '@/lib/api/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    captcha: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authAPI.register(formData);

      if (response.success) {
        // Registration successful - redirect to login
        window.location.href = '/login';
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
        minLength={8}
      />
      <input
        type="text"
        placeholder="Nickname"
        value={formData.nickname}
        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
      />
      <input
        type="text"
        placeholder="CAPTCHA"
        value={formData.captcha}
        onChange={(e) => setFormData({...formData, captcha: e.target.value})}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

### 2. Login with 2FA

```typescript
'use client'

import { useState } from 'react';
import { authAPI } from '@/lib/api/auth';

export default function LoginPage() {
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    captcha: '',
  });
  const [twoFACode, setTwoFACode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        // JWT cookie set - check if 2FA redirect happens
        // If api-gateway redirects to /check2FAQrCode, handle it
        window.location.href = '/home';
      }
    } catch (error: any) {
      if (error.message.includes('2FA')) {
        setStep('2fa');
      } else {
        alert('Login failed');
      }
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authAPI.validate2FA(twoFACode);

      if (response.success) {
        window.location.href = '/home';
      }
    } catch (error) {
      alert('Invalid 2FA code');
    }
  };

  if (step === '2fa') {
    return (
      <form onSubmit={handle2FA}>
        <h2>Two-Factor Authentication</h2>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={twoFACode}
          onChange={(e) => setTwoFACode(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit">Verify</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="CAPTCHA"
        value={credentials.captcha}
        onChange={(e) => setCredentials({...credentials, captcha: e.target.value})}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 3. Uploading Avatar

```typescript
'use client'

import { useState } from 'react';
import { usersAPI } from '@/lib/api/users';

export default function AvatarUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const response = await usersAPI.uploadAvatar(file);

      if (response.success) {
        alert('Avatar uploaded successfully!');
        // Refresh page or update UI
        window.location.reload();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload Avatar</h3>

      {preview && (
        <img src={preview} alt="Preview" width={200} height={200} />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

### 4. Sending Friend Request

```typescript
'use client'

import { friendsAPI } from '@/lib/api/friends';

export default function UserCard({ publicId, username }: { publicId: string, username: string }) {
  const handleAddFriend = async () => {
    try {
      const response = await friendsAPI.sendFriendRequest(publicId);

      if (response.success) {
        alert(`Friend request sent to ${username}!`);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request');
    }
  };

  return (
    <div className="user-card">
      <h3>{username}</h3>
      <button onClick={handleAddFriend}>Add Friend</button>
    </div>
  );
}
```

### 5. Joining Matchmaking Queue

```typescript
'use client'

import { useState, useEffect } from 'react';
import { MatchmakingClient, ClientState } from '@/lib/socket/matchmaking';

export default function MatchmakingPanel() {
  const [client, setClient] = useState<MatchmakingClient | null>(null);
  const [state, setState] = useState<ClientState>(ClientState.IDLE);

  useEffect(() => {
    // Get user data from your auth context/session
    const user = { email: 'user@example.com', id: 123, name: 'JohnDoe' };

    const matchClient = new MatchmakingClient(
      undefined,
      (payload) => {
        console.log('Match found!', payload);
        // Redirect to game
        window.location.href = payload.gameServerUrl;
      },
      (newState) => {
        setState(newState);
      }
    );

    matchClient.connect(user.email, user.id, user.name);
    setClient(matchClient);

    return () => {
      matchClient.disconnect();
    };
  }, []);

  const joinRanked = () => client?.enqueue('RANKED');
  const leaveQueue = () => client?.dequeue();

  return (
    <div>
      <h2>Matchmaking</h2>
      <p>Status: {state}</p>

      {state === ClientState.IDLE && (
        <button onClick={joinRanked}>Join Ranked Queue</button>
      )}

      {state === ClientState.IN_QUEUE && (
        <>
          <p>Searching for match...</p>
          <button onClick={leaveQueue}>Cancel</button>
        </>
      )}
    </div>
  );
}
```

### 6. Real-time Chat

See the complete chat example in the [WebSocket Connections](#websocket-connections) section above.

---

## API Reference

### Public Endpoints Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/` | GET | No | Landing page |
| `/login` | GET | No | Login page |
| `/checkLogin` | POST | No | Validate login |
| `/register` | GET | No | Registration page |
| `/checkRegister` | POST | No | Validate registration |
| `/forgotPassword` | GET | No | Password recovery |
| `/checkEmail` | POST | No | Send recovery email |
| `/validateEmailCode` | GET | No | Email verification |
| `/checkEmailCode` | POST | No | Validate email code |
| `/changePassword` | GET | No | Password reset |
| `/newPassword` | POST | No | Set new password |

### Private Endpoints Quick Reference

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Profile** | `/home`, `/changeUsername`, `/changeNickname`, `/changeEmail`, `/changeYourPassword`, `/changeDescription` | JWT + 2FA |
| **Upload** | `/upload` | JWT + 2FA |
| **Social** | `/seeAllUsers`, `/seeProfile`, `/chatAllUsers`, `/directMessage` | JWT + 2FA |
| **Friends** | `/friendInvite`, `/setAcceptFriend`, `/deleteAFriend`, `/blockTheUser`, `/handlerFriendsPage` | JWT + 2FA |
| **Matchmaking** | `/match`, `/match/join`, `/match/leave` | JWT + 2FA |
| **Games** | `/flappy-bird`, `/pong` | JWT + 2FA |
| **2FA** | `/get2FAQrCode`, `/check2FAQrCode`, `/validate2FAQrCode`, `/set2FAOnOff` | JWT |
| **Account** | `/deleteUserAccount`, `/logout` | JWT + 2FA |

### WebSocket Events Quick Reference

**Socket.io (Chat):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `join` | C → S | - |
| `joinPrivate` | C → S | `{target_id: string}` |
| `sendMessage` | C → S | `string` |
| `sendPrivateMessage` | C → S | `(msg: string, public_id: string)` |
| `sendInvite` | C → S | - |
| `sendPrivateInvite` | C → S | `string` (target_id) |
| `updateUsers` | S → C | `User[]` |
| `updateMessages` | S → C | `Message[]` |
| `updateDirectMessages` | S → C | `Message[]` |
| `updatePrivateUsers` | S → C | `User[]` |

**Match Service:**

| Message Type | Direction | Payload |
|--------------|-----------|---------|
| `CONNECT` | C → S | `{email, id, name}` |
| `ENQUEUE` | C → S | `{queue_type: "RANKED"\|"TOURNAMENT"}` |
| `DEQUEUE` | C → S | - |
| `EXIT` | C → S | - |
| `MATCH_FOUND` | S → C | `{matchId, gameServerUrl, players}` |

---

## Troubleshooting

### JWT Not Being Sent

**Problem**: API returns 401 even after successful login

**Solutions**:
- ✅ Ensure `credentials: 'include'` in fetch options
- ✅ Check cookie is set in browser (DevTools → Application → Cookies)
- ✅ Verify `sameSite` and `secure` settings match environment (http vs https)
- ✅ Check if domain/path matches

```typescript
// Correct
fetch('/api/endpoint', {
  credentials: 'include' // ← CRITICAL
});

// Wrong
fetch('/api/endpoint'); // Missing credentials
```

### CORS Errors

**Problem**: `Access to fetch blocked by CORS policy`

**Solutions**:
- ✅ Ensure api-gateway URL matches `NEXT_PUBLIC_API_GATEWAY_URL`
- ✅ Check nginx CORS headers are configured
- ✅ Verify `credentials: 'include'` is set
- ✅ In production, update nginx to allow your domain

```nginx
# nginx.conf
add_header Access-Control-Allow-Origin https://yourdomain.com;
add_header Access-Control-Allow-Credentials true;
```

### WebSocket Connection Failures

**Problem**: Socket.io or match service won't connect

**Solutions**:
- ✅ Check service is running (`docker-compose ps`)
- ✅ Verify URL is correct (ws:// or wss://)
- ✅ Ensure `withCredentials: true` for Socket.io
- ✅ Check JWT is valid (not expired)
- ✅ Look for errors in browser console

```typescript
// Correct Socket.io setup
const socket = io(url, {
  transports: ['websocket'],
  withCredentials: true, // ← CRITICAL for JWT
});
```

### 2FA Validation Problems

**Problem**: Stuck on 2FA screen even with correct code

**Solutions**:
- ✅ Check code is 6 digits from authenticator app
- ✅ Ensure time is synced on device (TOTP is time-based)
- ✅ Verify 2FA is enabled in database
- ✅ Check auth-service logs for validation errors

### Session Management Issues

**Problem**: Session data lost or not persisting

**Solutions**:
- ✅ Check `SESSION_SECRET` is set
- ✅ Verify cookie settings (httpOnly, sameSite)
- ✅ Ensure api-gateway container has persistent volume
- ✅ Check if session store is working

### Service Not Responding

**Problem**: Requests timeout or return 502/503

**Solutions**:

```bash
# Check all services are running
docker-compose ps

# Check specific service logs
docker-compose logs api-gateway
docker-compose logs auth-service

# Restart services
docker-compose restart api-gateway

# Rebuild if necessary
docker-compose up -d --build api-gateway
```

### Environment Variables Not Loaded

**Problem**: Default values being used instead of custom ones

**Solutions**:
- ✅ Check `.env.local` exists in frontend directory
- ✅ Verify variable names start with `NEXT_PUBLIC_` for client-side
- ✅ Restart Next.js dev server after changing .env
- ✅ Check backend .env files are mounted in docker-compose volumes

```bash
# Frontend
cd frontend
cat .env.local # Verify file exists

# Backend
docker-compose config # Shows merged configuration with env vars
```

---

## Additional Resources

- **API Gateway README**: [`api-gateway/README.md`](api-gateway/README.md)
- **Match Service README**: [`new-match-service/README.md`](new-match-service/README.md)
- **Frontend README**: [`frontend/README.md`](frontend/README.md)
- **Docker Compose**: [`docker-compose.yml`](docker-compose.yml)
- **Nginx Config**: [`nginx/nginx.conf`](nginx/nginx.conf)

---

## Support

For issues, questions, or contributions:
1. Check this integration guide
2. Review service-specific READMEs
3. Check Docker logs: `docker-compose logs -f`
4. Inspect network requests in browser DevTools
5. Contact the development team

---

**Last Updated**: December 2025
**Version**: 1.0.0
