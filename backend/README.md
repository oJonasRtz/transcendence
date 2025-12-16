# Database Schema

## Overview
This database manages a tournament system with user participation, games, and match history tracking.

## Entity Relationship Diagram
```mermaid
erDiagram
    USERS ||--o{ TOURNAMENT_PARTICIPANTS : "joins"
    USERS ||--o{ GAMES : "plays_as_p1"
    USERS ||--o{ GAMES : "plays_as_p2"
    USERS ||--o{ GAMES : "wins"
    USERS ||--o{ MATCH_HISTORY : "has"
    TOURNAMENTS ||--o{ TOURNAMENT_PARTICIPANTS : "has"
    TOURNAMENTS ||--o{ GAMES : "contains"
    GAMES ||--o{ MATCH_HISTORY : "records"
    
    USERS {
        integer id PK "AUTOINCREMENT"
        varchar(50) username UK "NOT NULL"
        varchar(100) email UK "NOT NULL"
        varchar(255) password_hash "NOT NULL"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
        datetime updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    TOURNAMENTS {
        integer id PK "AUTOINCREMENT"
        varchar(100) name "NOT NULL"
        varchar(20) status "DEFAULT pending, CHECK pending|active|completed|cancelled"
        integer max_participants "DEFAULT 8"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    TOURNAMENT_PARTICIPANTS {
        integer id PK "AUTOINCREMENT"
        integer tournament_id FK "NOT NULL, ON DELETE CASCADE"
        integer user_id FK "NOT NULL, ON DELETE CASCADE"
        datetime joined_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    GAMES {
        integer id PK "AUTOINCREMENT"
        integer tournament_id FK "ON DELETE SET NULL"
        integer player1_id FK "NOT NULL, ON DELETE CASCADE"
        integer player2_id FK "NOT NULL, ON DELETE CASCADE"
        integer winner_id FK "ON DELETE SET NULL"
        integer score_p1 "DEFAULT 0"
        integer score_p2 "DEFAULT 0"
        varchar(20) status "DEFAULT pending, CHECK pending|active|completed|cancelled"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
        datetime completed_at
    }
    
    MATCH_HISTORY {
        integer id PK "AUTOINCREMENT"
        integer user_id FK "NOT NULL, ON DELETE CASCADE"
        integer game_id FK "NOT NULL, ON DELETE CASCADE"
        varchar(10) result "CHECK win|loss|draw"
        integer score_for "DEFAULT 0"
        integer score_against "DEFAULT 0"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
    }
```

## Indexes

Performance optimization indexes:
- `idx_users_username` on users(username)
- `idx_users_email` on users(email)
- `idx_tournaments_status` on tournaments(status)
- `idx_tournament_participants_tournament` on tournament_participants(tournament_id)
- `idx_tournament_participants_user` on tournament_participants(user_id)
- `idx_games_tournament` on games(tournament_id)
- `idx_games_players` on games(player1_id, player2_id)
- `idx_games_status` on games(status)
- `idx_match_history_user` on match_history(user_id)
- `idx_match_history_game` on match_history(game_id)

## Constraints

- **UNIQUE**: tournament_participants(tournament_id, user_id) - prevents duplicate entries
- **CHECK**: Status fields enforce valid enum values
- **CASCADE**: Most foreign keys cascade on delete to maintain referential integrity
- **SET NULL**: Tournament and winner references set to NULL on delete to preserve game history