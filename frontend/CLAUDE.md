# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm i` - Install project dependencies
- `pnpm dev` - Start development server with Turbopack on localhost:3000
- `pnpm build` - Build application for production
- `pnpm start` - Start production server
- `prisma generate` - Generate Prisma client (runs automatically on postinstall)

## Project Architecture

This is a **Transcendence frontend** - a gaming platform built with Next.js 16 App Router, TypeScript, and Prisma/PostgreSQL. The application features user authentication, match tracking, achievements, friendships, and real-time chat.

### Core Technologies
- **Next.js 16** with App Router and Turbopack
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL database
- **Tailwind CSS** for styling with custom blue/black color palette
- **NextAuth.js v5 beta** for authentication
- **bcrypt** for password hashing

### Database Schema
The application uses a comprehensive gaming platform schema:
- **User** - Profile, authentication, online status
- **GameStats** - Wins, losses, ranking, XP, win streaks
- **Match** - Game records between players with results and scores
- **Achievement** - Unlockable rewards with categories (wins, matches, streak, ranking, special)
- **Friendship** - Social connections with status (pending, accepted, rejected, blocked)
- **Message/Conversation** - Chat system with conversation participants

### File Structure Patterns
- `app/` - Next.js App Router with route groups like `dashboard/(overview)`
- `app/lib/` - Utilities, data fetching functions, and type definitions
- `app/ui/` - Reusable UI components organized by feature
- `prisma/` - Database schema, migrations, and seed data
- `prisma/generated/` - Auto-generated Prisma client

### Import Conventions
- Use `@/` alias for root-level imports (configured in tsconfig.json)
- Import Prisma client from `@/prisma/generated/client`
- UI components imported from `@/app/ui/[feature]/[component]`

### Database Operations
- Main data queries are centralized in `app/lib/data.ts`
- Prisma client is configured with PG adapter for PostgreSQL connection
- Database seeding available through `prisma/seed.ts`
- All models include proper indexing for performance

### Authentication & Security
- Uses NextAuth.js v5 beta for session management
- Password hashing with bcrypt
- Environment variables for database and auth configuration