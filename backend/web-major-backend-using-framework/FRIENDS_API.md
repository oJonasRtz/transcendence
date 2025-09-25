# Relations API Documentation

This document describes the relations API endpoints that allow users to manage friendships and view online status.

## Database Schema

The relations functionality uses three main tables defined in `src/database/schemas/relationsSchema.sql`:

### `friend_requests`
- Stores friend requests between users
- Status: `pending`, `accepted`, `rejected`, `blocked`
- Unique constraint on (requester_id, addressee_id)

### `friends`
- Stores accepted friendships
- Uses consistent ordering (user1_id < user2_id) to avoid duplicates
- Unique constraint on (user1_id, user2_id)

### `user_status`
- Stores user online status and last seen information
- One record per user
- Tracks: `is_online`, `last_seen`, `status_message`

## API Endpoints

### 1. Get Friends List with Online Status
**GET** `/relations/friends/:userId`

Returns all friends of a user with their online status.

**Response:**
```json
{
  "message": "Friends list retrieved successfully",
  "friends": [
    {
      "friend_id": 2,
      "username": "friend_user",
      "email": "friend@example.com",
      "is_online": true,
      "last_seen": "2024-01-15T10:30:00Z",
      "status_message": "Playing a game",
      "friendship_date": "2024-01-10T08:00:00Z"
    }
  ]
}
```

### 2. Get Pending Friend Requests (Received)
**GET** `/relations/requests/pending/:userId`

Returns all pending friend requests received by a user.

**Response:**
```json
{
  "message": "Pending friend requests retrieved successfully",
  "requests": [
    {
      "requester_id": 3,
      "username": "requester_user",
      "email": "requester@example.com",
      "request_date": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### 3. Get Sent Friend Requests
**GET** `/relations/requests/sent/:userId`

Returns all friend requests sent by a user.

**Response:**
```json
{
  "message": "Sent friend requests retrieved successfully",
  "requests": [
    {
      "addressee_id": 4,
      "username": "target_user",
      "email": "target@example.com",
      "status": "pending",
      "request_date": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### 4. Send Friend Request
**POST** `/relations/request/:userId`

Sends a friend request from one user to another.

**Request Body:**
```json
{
  "targetUserId": 5
}
```

**Response:**
```json
{
  "message": "Friend request sent successfully"
}
```

**Error Responses:**
- `400`: Cannot send friend request to yourself
- `404`: User not found
- `409`: Users are already friends / Friend request already sent

### 5. Accept Friend Request
**POST** `/relations/accept/:userId`

Accepts a pending friend request.

**Request Body:**
```json
{
  "requesterId": 3
}
```

**Response:**
```json
{
  "message": "Friend request accepted successfully"
}
```

**Error Responses:**
- `404`: Friend request not found
- `400`: Invalid request status

### 6. Reject Friend Request
**POST** `/relations/reject/:userId`

Rejects a pending friend request.

**Request Body:**
```json
{
  "requesterId": 3
}
```

**Response:**
```json
{
  "message": "Friend request rejected successfully"
}
```

**Error Responses:**
- `404`: Friend request not found
- `400`: Invalid request status

### 7. Remove Friend
**DELETE** `/relations/:userId`

Removes a friend from the user's friends list.

**Request Body:**
```json
{
  "friendId": 2
}
```

**Response:**
```json
{
  "message": "Friend removed successfully"
}
```

**Error Responses:**
- `404`: Users are not friends

### 8. Update User Online Status
**POST** `/relations/status/:userId`

Updates a user's online status and status message.

**Request Body:**
```json
{
  "isOnline": true,
  "statusMessage": "Playing a game"
}
```

**Response:**
```json
{
  "message": "User status updated successfully"
}
```

### 9. Get User Online Status
**GET** `/relations/status/:userId`

Gets a user's online status and information.

**Response:**
```json
{
  "message": "User status retrieved successfully",
  "user": {
    "id": 1,
    "username": "user123",
    "is_online": true,
    "last_seen": "2024-01-15T10:30:00Z",
    "status_message": "Playing a game"
  }
}
```

## Usage Examples

### Complete Friend Request Flow

1. **Send Friend Request:**
   ```bash
   POST /relations/request/1
   {
     "targetUserId": 2
   }
   ```

2. **Check Pending Requests (User 2):**
   ```bash
   GET /relations/requests/pending/2
   ```

3. **Accept Friend Request:**
   ```bash
   POST /relations/accept/2
   {
     "requesterId": 1
   }
   ```

4. **View Friends List:**
   ```bash
   GET /relations/friends/1
   ```

5. **Update Online Status:**
   ```bash
   POST /relations/status/1
   {
     "isOnline": true,
     "statusMessage": "Available for games"
   }
   ```

## Error Handling

All endpoints include comprehensive error handling with appropriate HTTP status codes:

- `400`: Bad Request (invalid input, cannot add self, etc.)
- `404`: Not Found (user not found, request not found, etc.)
- `409`: Conflict (already friends, request already sent, etc.)
- `500`: Internal Server Error (database errors, etc.)

## Database Features

- **Consistent Ordering**: Friends are stored with user1_id < user2_id to prevent duplicate entries
- **Cascade Deletes**: When users are deleted, all related friend data is automatically cleaned up
- **Indexes**: Optimized database indexes for fast queries on user relationships
- **Status Tracking**: Real-time online status with last seen timestamps
- **Request History**: Complete audit trail of friend requests and their status changes
