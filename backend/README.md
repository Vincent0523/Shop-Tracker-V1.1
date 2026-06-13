# Shop Tracker Backend

This backend provides authentication, staff management, and sales APIs for the Shop Tracker app.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGO_URI` and `JWT_SECRET`
3. Run `npm install`
4. Run `npm run dev`

## API Endpoints

- `POST /api/auth/login` — login with username and password
- `GET /api/users` — list users (admin only)
- `POST /api/users` — create staff user (admin only)
- `GET /api/sales` — list sales
- `POST /api/sales` — create a sale

## Real-time updates

Sales are emitted with Socket.IO on `sale-created` events.
