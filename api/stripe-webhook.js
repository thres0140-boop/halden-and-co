const Stripe = require('stripe');
const { pool } = require('./_db');
const PRICE_IDS = require('../stripe-prices.json');
const DAYS = 30;

module.exports.config = { api: { bodyParser: false } };

async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

module.exports = async function handler(req, res) {
  const send = (code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await rawBody(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return send(400, { error: `Webhook: ${e.message}` });
  }

  try {
    if (event.type === 'setup_intent.succeeded') {
      const si = event.data.object;
      const { rows } = await pool.query(
        `SELECT id, session_id, stripe_sub FROM trials WHERE stripe_customer = $1 ORDER BY id DESC LIMIT 1`,
        [si.customer]);
      const t = rows[0];
      if (!t) return send(200, { received: true, skipped: 'no row' });
      if (t.stripe_sub) return send(200, { received: true, skipped: 'already subscribed' });

      const price = PRICE_IDS['design-club'];
      if (!price) return send(500, { error: 'Design Club price missing in stripe-prices.json' });

      const sub = await stripe.subscriptions.create({
        customer: si.customer,
        default_payment_method: si.payment_method,
        items: [{ price, quantity: 1 }],
        trial_period_days: DAYS,
        payment_behavior: 'allow_incomplete',
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        metadata: { product: 'design-club', trial: String(t.id), session: t.session_id },
      }, { idempotencyKey: `sub_${si.id}` });

      await pool.query(
        `UPDATE trials SET stripe_sub = $1, stripe_pm = $2, status = 'trialing' WHERE id = $3`,
        [sub.id, si.payment_method, t.id]);
    }

    if (event.type === 'setup_intent.setup_failed') {
      const si = event.data.object;
      await pool.query(
        `UPDATE trials SET status = 'failed', fail_reason = $1 WHERE stripe_customer = $2`,
        [si.last_setup_error?.message || 'setup failed', si.customer]);
    }

    if (event.type === 'invoice.payment_succeeded' && event.data.object.subscription) {
      await pool.query(`UPDATE trials SET status = 'paid' WHERE stripe_sub = $1`,
        [event.data.object.subscription]);
    }

    if (event.type === 'invoice.payment_failed' && event.data.object.subscription) {
      await pool.query(`UPDATE trials SET status = 'dunning', fail_reason = $1 WHERE stripe_sub = $2`,
        [event.data.object.last_finalization_error?.message || 'charge failed', event.data.object.subscription]);
    }

    send(200, { received: true });
  } catch (e) {
    console.error('webhook', e);
    send(500, { error: e.message });
  }
};
