// POST /api/subscribe  ->  { url }
// Starts a Stripe Checkout for the Design Club membership: 30 days free, then €29/month.
// The card is collected up front and charged automatically when the trial ends unless the member cancels.
const Stripe = require('stripe');
const PRICE_IDS = require('../stripe-prices.json');

module.exports = async function handler(req, res) {
  const send = (code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return send(500, { error: 'Stripe is not configured yet (STRIPE_SECRET_KEY missing).' });
  const price = PRICE_IDS['design-club'];
  if (!price) return send(500, { error: 'Design Club price missing. Run "node scripts/stripe-design-club.js".' });

  const origin = req.headers.origin || `https://${req.headers.host}`;
  try {
    const session = await Stripe(process.env.STRIPE_SECRET_KEY).checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        metadata: { product: 'design-club' },
      },
      payment_method_collection: 'always',
      success_url: `${origin}/#/club/welcome?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/club`,
    });
    send(200, { url: session.url });
  } catch (e) {
    send(500, { error: e.message });
  }
};
