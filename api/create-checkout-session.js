// POST /api/create-checkout-session { id, colors:[] } -> { clientSecret }
// Creates a Stripe Embedded Checkout session. Price comes from Stripe, never the browser.
const Stripe = require('stripe');
const { PRODUCTS } = require('../products.js');
const PRICE_IDS = require('../stripe-prices.json');
module.exports = async (req, res) => {
  const send = (c, b) => { res.statusCode = c; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return send(500, { error: 'Stripe no está configurado.' });
  const b = req.body || {};
  const p = PRODUCTS.find(x => x.id === b.id);
  if (!p) return send(400, { error: 'Producto desconocido.' });
  const price = PRICE_IDS[p.id];
  if (!price) return send(500, { error: 'Falta el precio en Stripe.' });
  const colors = Array.isArray(b.colors) ? b.colors.join(' + ').slice(0, 200) : '';
  const origin = req.headers.origin || `https://${req.headers.host}`;
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      adaptive_pricing: { enabled: false },
      line_items: [{ price, quantity: 1 }],
      shipping_address_collection: { allowed_countries: ['ES', 'NL', 'DE'] },
      phone_number_collection: { enabled: true },
      metadata: { bundle: p.id, units: String(p.units), colors },
      payment_intent_data: { metadata: { bundle: p.id, colors }, description: `${p.name} | ${colors}` },
      return_url: `${origin}/#/order/success?session_id={CHECKOUT_SESSION_ID}`,
    });
    send(200, { clientSecret: session.client_secret });
  } catch (e) { send(500, { error: e.message }); }
};
