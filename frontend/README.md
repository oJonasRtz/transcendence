# Frontend Minor Module

## Minimal technical requirement
- Single Page Application (SPA)
- Compatible with Mozilla Firefox
- Writen in TypeScript
- Tailwind for CSS styling

## Tech stack
- React: to build interactive UI
- Next.js: to manage routes and optimize fonts and images
- Neon/Postgres: database provider

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
    users ||--o{ friendships : "requests friendship"
    users ||--o{ friendships : "receives friendship"

    users {
        SERIAL id PK "Primary Key"
        VARCHAR(50) username UK "Unique, Not Null"
        VARCHAR(100) email UK "Unique, Not Null"
        VARCHAR(255) password_hash "Not Null"
        VARCHAR(255) avatar "Default avatar path"
        BOOLEAN is_online "Default: false"
        TIMESTAMP last_seen "Nullable"
        TIMESTAMP created_at "Auto-set on create"
        TIMESTAMP updated_at "Auto-set on update"
    }

    friendships {
        SERIAL id PK "Primary Key"
        INT user_id FK "References users(id), Indexed"
        INT friend_id FK "References users(id), Indexed"
        VARCHAR(20) status "Indexed, Default: pending"
        TIMESTAMP created_at "Auto-set on create"
        TIMESTAMP updated_at "Auto-set on update"
    }
```
