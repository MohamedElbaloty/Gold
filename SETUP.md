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

### 2. Setup MongoDB

Make sure MongoDB is running on your system. You can:
- Use local MongoDB: `mongodb://localhost:27017`
- Or use MongoDB Atlas (cloud): Update the connection string in `.env`

### 3. Configure Environment Variables

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gold-trading
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
USD_TO_SAR_RATE=3.75
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 4. Start the Application

**Option 1: Run both together (recommended)**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

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

1. **Register a new account** at http://localhost:3000/register
2. **Deposit SAR** (for testing):
   ```bash
   # Use Postman or curl
   POST http://localhost:5000/api/wallet/deposit
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
- Ensure backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify API URL in frontend code (should be `http://localhost:5000`)

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
