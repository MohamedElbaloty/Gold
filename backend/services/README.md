# Pricing Service

## Gold Price API

The pricing service currently uses a free API endpoint. For production use, you should replace this with a reliable paid service.

### Current Implementation
- Uses `api.metals.live` (free tier)
- Converts USD per ounce to USD per gram
- Has fallback to last known price if API fails

### Recommended Production APIs

1. **GoldAPI.io**
   - Reliable, real-time gold prices
   - Free tier: 100 requests/month
   - Paid plans available
   - Example: `https://www.goldapi.io/api/XAU/USD`

2. **MetalsAPI**
   - Multiple metal prices
   - Free tier: 50 requests/month
   - Example: `https://api.metals.live/v1/spot/gold`

3. **Alpha Vantage**
   - Financial data API
   - Free tier available
   - Example: `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=YOUR_KEY`

4. **Broker Feeds**
   - Connect directly to gold broker APIs
   - Most reliable but requires partnership

### Updating the API

To change the API source, modify `fetchGoldSpotPrice()` in `pricingService.js`:

```javascript
async function fetchGoldSpotPrice() {
  try {
    // Replace with your API
    const response = await axios.get('YOUR_API_URL', {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY' // if needed
      },
      timeout: 5000
    });
    
    // Parse response based on your API format
    const pricePerOunceUSD = response.data.price; // Adjust based on API
    const pricePerGramUSD = pricePerOunceUSD / 31.1035;
    
    return pricePerGramUSD;
  } catch (error) {
    // Fallback logic
  }
}
```

### Price Update Frequency

- Default: 30 seconds
- Configurable via MerchantSettings
- Updates stored in PriceSnapshot collection for audit

### Spread Calculation

- Buy Price = Spot × (1 + spread/2 + buyMarkup)
- Sell Price = Spot × (1 - spread/2 - sellMarkup)
- Spread and markups configurable by merchant/admin
