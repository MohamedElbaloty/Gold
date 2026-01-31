# Gold Trading Platform

A full-stack web application for buying, selling, and storing gold bullion digitally in Saudi Arabia, with optional physical delivery.

## Features

- **Real-time Gold Pricing**: Live gold spot prices (XAU/USD) converted to SAR with configurable spreads
- **Trading System**: Buy and sell gold instantly at live prices
- **Wallet System**: Track gold balance (grams) and SAR balance with complete transaction history
- **Physical Delivery**: Request physical delivery of gold (10g, 50g, 100g, 1kg)
- **Role-based Access**: Separate interfaces for Users, Merchants, and Admins
- **Admin Dashboard**: Manage spreads, view exposure, monitor trades, and control pricing

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- RESTful API
- Real-time price updates (polling)

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS

## Project Structure

```
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic (pricing, trading)
│   ├── middleware/      # Auth & authorization
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   └── App.js       # Main app component
│   └── public/
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Railway MongoDB plugin or Atlas — **MONGODB_URI** required)

### Deploy on Railway (recommended)

1. Connect the repo to Railway and deploy from **main**.
2. Add **MONGODB_URI** in Railway Variables (from MongoDB plugin or Atlas connection string).
3. No `localhost` defaults — all config from Railway env.

See **RAILWAY-DEPLOY.md** for details.

### Backend (e.g. for scripts or local run)

1. Install: `npm install`
2. Set **MONGODB_URI** (e.g. in `backend/.env` or Railway Variables). Copy `backend/.env.example` to `backend/.env` and fill values.
3. Start: `npm run server`

### Frontend

1. `cd frontend && npm install && npm start`
2. API URL: set **REACT_APP_API_URL** if frontend and backend are on different origins; otherwise same-origin (empty) is used.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Pricing
- `GET /api/pricing/current` - Get current gold prices
- `GET /api/pricing/history` - Get price history (authenticated)

### Trading
- `POST /api/trade/buy` - Buy gold
- `POST /api/trade/sell` - Sell gold
- `GET /api/trade/orders` - Get user's order history

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/deposit` - Deposit SAR (for testing)

### Delivery
- `POST /api/delivery/request` - Create delivery request
- `GET /api/delivery/my-requests` - Get user's delivery requests
- `GET /api/delivery/all` - Get all requests (merchant/admin)
- `PUT /api/delivery/:id/status` - Update delivery status

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/settings` - Get merchant settings
- `PUT /api/admin/settings` - Update merchant settings
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/freeze` - Freeze/unfreeze user (admin only)

## User Roles

1. **User (Customer)**
   - Register/Login
   - Buy/Sell gold
   - View wallet and transactions
   - Request physical delivery
   - View order history

2. **Merchant (Gold Dealer)**
   - All user features
   - Set buy/sell spread
   - View total exposure
   - Manage delivery requests
   - View all trades

3. **Admin**
   - All merchant features
   - User management
   - Freeze accounts
   - Full system control

## Database Models

- **User**: User accounts with roles and KYC structure
- **Wallet**: Gold and SAR balances per user
- **Transaction**: Immutable transaction ledger
- **Order**: Buy/sell orders with price snapshots
- **PriceSnapshot**: Historical price data for audit
- **DeliveryRequest**: Physical delivery requests
- **MerchantSettings**: Spread and pricing configuration

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation (express-validator)
- Rate limiting
- Transaction atomicity (MongoDB sessions)
- Password hashing (bcrypt)
- Account freeze capability

## Price Engine

The system fetches gold spot prices from external APIs, converts USD to SAR, and calculates:
- **Buy Price** = Spot + Spread/2 + Buy Markup
- **Sell Price** = Spot - Spread/2 - Sell Markup

Prices update every 30-60 seconds (configurable) and are stored for audit purposes.

## Testing

To test the system:

1. Register a new user account
2. Deposit SAR (use `/api/wallet/deposit` endpoint)
3. Buy gold at current prices
4. View wallet balance and transactions
5. Sell gold back
6. Request physical delivery (if you have gold balance)

## Future Enhancements

- Mobile app support
- Multiple merchants
- External custody integration
- Saudi payment gateways (Mada, STC Pay, etc.)
- KYC + governance compliance modules (SGG)
- Advanced analytics and reporting
- WebSocket for real-time price updates
- Arabic language support

## License

ISC
