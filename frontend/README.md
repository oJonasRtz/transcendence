# Frontend Minor Module

## Minimal technical requirement
- Single Page Application (SPA)
- Compatible with Mozilla Firefox
- Writen in TypeScript
- Tailwind for CSS styling

## Tech stack
- React: to build interactive UI
- Next.js: to manage routes and optimize fonts and images
- Prisma/Postgres: ORM and database provider

## System requirements
- Node.js 20.9 or later installed.
- Operating system: Linux, Mac and Windows.
- pnpm 10.x

## Running the development server
Run `pnpm i` to install the project's packages.
```bash
pnpm i
```
Followed by `pnpm dev` to start the development server.
```bash
pnpm dev
```
Open http://localhost:3000 on your browser.

## Database Schema
```mermaid
erDiagram
    User ||--o| GameStats : "has"
    User ||--o{ Match : "plays as player1"
    User ||--o{ Match : "plays as player2"
    User ||--o{ UserAchievement : "has"
    User ||--o{ Friendship : "sends"
    User ||--o{ Friendship : "receives"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"
    User ||--o{ ConversationParticipant : "participates"
    Achievement ||--o{ UserAchievement : "unlocked by"
    Conversation ||--o{ ConversationParticipant : "has"
    Conversation ||--o{ Message : "contains"

    User {
        int id PK
        string username UK
        string email UK
        string passwordHash
        string avatar
        boolean isOnline
        datetime lastSeen
        datetime createdAt
        datetime updatedAt
    }

    Conversation {
        int id PK
        datetime createdAt
        datetime updatedAt
    }

    ConversationParticipant {
        int id PK
        int conversationId FK
        int userId FK
        datetime joinedAt
    }

    Message {
        int id PK
        int conversationId FK
        int senderId FK
        int receiverId FK
        text content
        boolean isRead
        datetime createdAt
        datetime updatedAt
    }

    GameStats {
        int id PK
        int userId FK,UK
        int wins
        int losses
        int draws
        int ranking
        int level
        int xp
        int winStreak
        datetime createdAt
        datetime updatedAt
    }

    Match {
        int id PK
        int player1Id FK
        int player2Id FK
        int winnerId
        enum result
        string score
        int duration
        datetime playedAt
    }

    Achievement {
        int id PK
        string name UK
        string description
        string icon
        enum category
        int requirement
        int xpReward
        datetime createdAt
    }

    UserAchievement {
        int id PK
        int userId FK
        int achievementId FK
        datetime unlockedAt
        int progress
    }

    Friendship {
        int id PK
        int userId FK
        int friendId FK
        enum status
        datetime createdAt
        datetime updatedAt
    }
```
