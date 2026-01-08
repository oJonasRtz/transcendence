# Chat Application Tech Stack Migration Plan

## Migration Overview

**Migration Type:** Frontend + Backend consolidation
**From:** Vanilla JS + EJS Templates
**To:** React + Next.js (Full-stack)

---

## Target Architecture

```
┌─────────────────────────────┐
│       Next.js App           │
│      (Port 3000)            │
│                             │
│  • React Components         │
│  • Next.js Pages            │
│  • API Routes (non-RT)      │
└──────────┬──────────────────┘
           │
           │ HTTP/WebSocket
           │
    ┌──────┴───────────────────────┐
    │                              │
┌───▼────────────┐      ┌─────────▼────────┐
│  api-gateway   │      │  chat-service    │
│  (Port 3000)   │─────→│  (Port 3005)     │
│                │      │                  │
│ • Socket.io    │      │ • Message DB     │
│ • WebSockets   │      │ • Persistence    │
│ • Public Chat  │      │                  │
│ • Direct Msg   │      │                  │
└────────────────┘      └──────────────────┘
```

---

## Services Breakdown

### 1. Next.js App
**Responsibility:** Frontend + Non-realtime API

**Components:**
- React components (replacing EJS templates)
- Next.js pages
- API routes for non-realtime operations
- Static assets
- Client-side Socket.io connection management

**Key Changes:**
- ✅ Chat page migrated
- Renders → React Components
- Controllers → Next.js API Routes (where applicable)
- Routes → Next.js file-based routing

---

### 2. api-gateway (EXISTING - Port 3000)
**Responsibility:** Real-time Communication

**Keeps:**
- Socket.io server
- WebSocket connections
- Public chat handling
- Direct message routing

**Configuration:**
- Entry point: `node server.js`
- Tech stack: Socket.io + Fastify + Nodejs
- Files:
 - api-gateway/config/socket.js
 - api-gateway/public/js/direct.js
 - api-gateway/public/js/chat.js
 - api-gateway/views/chatAllUsers.ejs
 - api-gateway/views/chatDirectUsers.ejs
 - api-gateway/controllers/privateControllers.js
 - api-gateway/routes/privateRoutes.js
- Endpoints:
  - `listen to: http://api-gateway:3000`
  - - /socket.io/ WebSocket endpoint
 - Routes:
  - GET /chatAllUsers
  - GET /directMessage 
 - Socket commands:
  - joinPrivate
  - join
  - sendPrivateInvite
  - sendInvite
  - sendMessage
  - sendPrivateMessage
  - connect
  - updatePrivateUsers
  - updateDirectMessages
  - updateNotifications
  - updateChannels
  - disconnect

### 3. chat-service (EXISTING - Port 3005)
**Responsibility:** Message Persistence

**Keeps:**
- Database operations for messages
- Message storage and retrieval

**Endpoints (POST methods - NO MIGRATION):**
- `POST /storeMessage`
- `POST /getCellMessage`
- `POST /getCellRemoteMessage`
- `POST /storePrivateMessage`
- `POST /setForgetAll`
- `POST /getForgetAll`

**Configuration:**
- Entry point: `node server.js`
- Tech: Nodejs + Fastify
- Endpoints:
  - `listen at: chat-service:3005`
  - `listen at: http://chat-service:3005`
