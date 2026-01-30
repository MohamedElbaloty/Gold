# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. MongoDB (required)

- **Railway**: set **MONGODB_URI** in Variables (from Railway MongoDB plugin or MongoDB Atlas).
- No default URL — **MONGODB_URI** must be set (Railway or in `backend/.env` for scripts).

### 3. Environment Variables

Create `backend/.env` from `backend/.env.example` and set:

- **MONGODB_URI** — from Railway (MongoDB plugin/Atlas). Required.
- **JWT_SECRET** — strong random string in production.
- **PORT**, **JWT_EXPIRE**, **USD_TO_SAR_RATE** as needed.

### 4. Start the Application

**Railway**: Deploy from GitHub; set Variables (MONGODB_URI, etc.). No localhost.

**Local / scripts:**

```bash
npm run dev
```

Or: Terminal 1 `npm run server`, Terminal 2 `cd frontend && npm start`.

### 5. Access

- **Railway**: use the app URL Railway gives you.
- **Local**: frontend and backend URLs depend on your setup; set **REACT_APP_API_URL** if frontend and backend are on different origins.

## Gold Price API Configuration

The system uses a free gold price API by default. For production, you should:

1. **Replace with a reliable API** such as:
   - GoldAPI.io
   - MetalsAPI
   - Alpha Vantage
   - Or connect to a broker feed

2. **Update `backend/services/pricingService.js`**:
   - Replace the API endpoint
   - Add API key if required
   - Adjust response parsing based on API format

## Creating Admin/Merchant Users

By default, new users are created as 'user' role. To create admin/merchant:

1. Register a user normally
2. In MongoDB, update the user document:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass/Studio 3T to change the role field.

## Testing the System

1. **Register a new account** at the app URL (Railway or your frontend URL).
2. **Deposit SAR** (for testing):
   ```bash
   POST <BACKEND_URL>/api/wallet/deposit
   Headers: Authorization: Bearer <your-token>
   Body: { "amount": 10000 }
   ```
3. **Buy Gold**: Navigate to Trading page and buy some gold
4. **View Wallet**: Check your balance and transactions
5. **Sell Gold**: Sell some gold back
6. **Request Delivery**: If you have gold, request physical delivery

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change `PORT` in `backend/.env`
- Or kill the process using the port

### Gold Price API Not Working
- The free API might have rate limits
- Check browser console for errors
- Update to a paid API service

### Frontend Can't Connect to Backend
- On Railway: backend and frontend usually same origin; no extra API URL.
- If frontend and backend are on different domains, set **REACT_APP_API_URL** to the backend URL.
- Check CORS in `backend/server.js` if needed.

## Production Deployment

Before deploying:

1. **Security**:
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Set up proper CORS
   - Add rate limiting (already included)
   - Use environment variables for all secrets

2. **Database**:
   - Use MongoDB Atlas or managed MongoDB
   - Enable authentication
   - Set up backups

3. **Gold Price API**:
   - Use a reliable, paid API service
   - Add error handling and fallbacks
   - Consider caching strategies

4. **Frontend**:
   - Build for production: `cd frontend && npm run build`
   - Serve static files or deploy to CDN
   - Update API URLs to production backend

5. **Monitoring**:
   - Add logging (Winston, Morgan)
   - Set up error tracking (Sentry)
   - Monitor API response times

## Next Steps

- Integrate Saudi payment gateways (Mada, STC Pay)
- Add KYC/AML compliance
- Implement Arabic language support
- Add mobile app
- Set up WebSocket for real-time prices
- Add email notifications
- Implement 2FA authentication
