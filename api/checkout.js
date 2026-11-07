// POST /api/checkout  { items: [{ id, color, size, qty }] }  ->  { url }
// Creates a Stripe Checkout Session. Prices come from Stripe (stripe-prices.json),
// never from the browser, so nobody can change what they pay.
const Stripe = require('stripe');
const { PRODUCTS } = require('../products.js');
const PRICE_IDS = require('../stripe-prices.json');
let SUPPLIER = {}; try { SUPPLIER = require('./_supplier.json'); } catch {} // private, not in git

module.exports = async function handler(req, res) {
  const send = (code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return send(500, { error: 'Stripe is not configured yet (STRIPE_SECRET_KEY missing).' });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length || items.length > 50) return send(400, { error: 'Your cart is empty.' });

  const line_items = [], summary = [];
  for (const i of items) {
    const p = PRODUCTS.find(x => x.id === i.id);
    const qty = Math.min(Math.max(parseInt(i.qty, 10) || 1, 1), 10);
    if (!p) return send(400, { error: `Unknown product: ${i.id}` });
    const price = PRICE_IDS[p.id];
    if (!price) return send(500, { error: `No Stripe price linked to ${p.name}. Run "npm run stripe:setup" or add it to stripe-prices.json.` });
    line_items.push({ price, quantity: qty });
    summary.push(`${p.name} | ${String(i.color).slice(0, 30)} | x${qty} | ref ${(SUPPLIER[p.id] && SUPPLIER[p.id].asins && SUPPLIER[p.id].asins[i.color]) || '-'}`);
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      // colour/size per item are not part of the Stripe price, so they travel as metadata + description
      metadata: Object.fromEntries(summary.slice(0, 40).map((s, n) => [`item_${n + 1}`, s.slice(0, 500)])),
      payment_intent_data: { description: summary.join(' ; ').slice(0, 1000) },
      shipping_address_collection: { allowed_countries: ['NL', 'BE', 'DE', 'FR', 'ES', 'IT', 'AT', 'LU', 'IE', 'PT', 'PL', 'DK', 'SE', 'FI', 'GB', 'US'] },
      phone_number_collection: { enabled: true },
      success_url: `${origin}/#/order/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/order/cancelled`,
    });
    send(200, { url: session.url });
  } catch (e) {
    send(500, { error: e.message });
  }
};
