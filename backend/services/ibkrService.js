/**
 * Stub service for Interactive Brokers integration.
 *
 * For the business demo we keep everything internal (no live orders are sent),
 * but all trading flows are wired through this service so that later you can
 * replace the mock implementations with real IBKR API calls.
 */

// Example shape for a place-order call. In real integration you would:
// - Authenticate against IBKR Client Portal / Gateway
// - Map instrument/side/qty into IBKR contract + order objects
// - Send HTTP requests and handle responses + errors.

async function placeGoldOrderMock({ side, goldAmount, leverage, price }) {
  // This function intentionally does nothing "external".
  // It just returns a fake IB order id for tracing in logs.
  const fakeOrderId = `IBKR-DEMO-${Date.now()}`;
  return {
    orderId: fakeOrderId,
    side,
    goldAmount,
    leverage,
    price
  };
}

module.exports = {
  placeGoldOrderMock
};

