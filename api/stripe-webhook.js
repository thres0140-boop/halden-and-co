// POST /api/stripe-webhook — verifies the Stripe signature and stores completed orders.
const Stripe = require('stripe');
const { saveOrder } = require('./_orders.js');
module.exports = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret) { res.statusCode = 500; return res.end('not configured'); }
  let raw = req.rawBody;
  if (raw === undefined || raw === null) { const chunks = []; for await (const c of req) chunks.push(c); raw = Buffer.concat(chunks); }
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try { event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], secret); }
  catch (e) { res.statusCode = 400; return res.end(`Webhook Error: ${e.message}`); }
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    try {
      await saveOrder({
        id: s.id, email: s.customer_details && s.customer_details.email,
        phone: s.customer_details && s.customer_details.phone,
        name: s.customer_details && s.customer_details.name,
        amount_total: s.amount_total, currency: s.currency,
        bundle: s.metadata && s.metadata.bundle, units: parseInt((s.metadata && s.metadata.units) || '1', 10),
        colors: s.metadata && s.metadata.colors,
        shipping: JSON.stringify(s.shipping_details || (s.customer_details && s.customer_details.address) || null),
        status: s.payment_status,
      });
    } catch (e) { console.error('order save failed:', e.message); }
  }
  res.statusCode = 200; res.end(JSON.stringify({ received: true }));
};
