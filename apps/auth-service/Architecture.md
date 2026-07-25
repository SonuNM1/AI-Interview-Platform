## Responsibilities 

- Register
- Login
- Password
- JWT
- Refresh Token 
- Logout

We use Docker to run PostgreSQL locally without installing it on Windows. Prisma is our ORM that converts TypeScript code into SQL queries, making database operations easier and type-safe. Prisma Studio is only a UI to view and edit the data—it is not the database. The actual data is stored in the PostgreSQL database running inside the Docker container.

# Why Store Session ID in Refresh Token?

## Problem

Refresh Tokens are stored in the database as **bcrypt hashes** for security.

Example:

| Session | Token Hash |
|---------|------------|
| 1 | $2b$... |
| 2 | $2b$... |
| 3 | $2b$... |

When the frontend sends a refresh token:

```
eyJhbGc...
```

the backend **cannot search** for it because the database stores only the hash.

So it has to do this:

```
Get all refresh tokens
        │
        ▼
Compare with Row 1
        │
Compare with Row 2
        │
Compare with Row 3
        │
Match Found
```

This works, but if the application has millions of refresh tokens, the backend must compare against every row, making the refresh request slow.

---

# Better Design (Production Approach)

While generating the Refresh Token, also generate a unique **Session ID**.

Example:

```
Session ID

ab12cd34
```

Store it in the database.

| Session ID | Token Hash |
|------------|------------|
| ab12cd34 | $2b$... |

Also include it inside the Refresh JWT payload.

```json
{
    "id": "userId",
    "email": "user@gmail.com",
    "role": "CANDIDATE",
    "sessionId": "ab12cd34"
}
```

---

# Refresh Flow

```
Refresh Token
      │
Verify JWT
      │
Read Session ID
      │
Find One Database Row
      │
bcrypt.compare()
      │
Generate New Access Token
```

Instead of checking every row, the backend directly finds the correct session.

---

# Why Still Use bcrypt.compare()?

Finding the Session ID is **not enough**.

A hacker might somehow know or guess a Session ID.

So after fetching the correct database row, the backend still compares the incoming Refresh Token with the stored hash.

```
Incoming Refresh Token
        │
bcrypt.compare()
        │
Match ?
        │
Generate Access Token
```

This ensures that only the original Refresh Token can generate a new Access Token.

---

# Benefits

- O(1) database lookup instead of scanning all refresh tokens.
- Faster refresh requests.
- Easier logout.
- Easier logout from all devices.
- Scales well for millions of users.
- Production-ready architecture.