# Test credentials (after running seed)

1. Copy `backend/.env.example` → `backend/.env` and set `JWT_SECRET`.
2. Start MongoDB, then backend: `npm run server` (or `node backend/server.js`).
3. Run seed: `node backend/scripts/seedUsers.js`
4. Start frontend: `cd frontend && npm start`.

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| User  | user@test.com   | user123   |
| Admin | admin@test.com  | admin123  |

- **User**: Login → Trading, Wallet, Orders. Use for buying/selling gold.
- **Admin**: Login → Admin (`/admin`). Manage user orders, settings, overview.
