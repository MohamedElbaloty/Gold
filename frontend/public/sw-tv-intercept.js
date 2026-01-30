// Intercept TradingView support-portal request (403) so it never hits the network.
// Requests from the chart iframe go through this SW when it's in scope.
self.addEventListener('fetch', function (event) {
  var url = event.request.url || '';
  if (url.indexOf('tradingview-widget') === -1) return;
  if (url.indexOf('support-portal-problems') === -1 && url.indexOf('support') === -1) return;
  event.respondWith(
    new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  );
});
