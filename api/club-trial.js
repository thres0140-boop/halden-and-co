const Stripe = require('stripe');
const { pool } = require('./_db');

module.exports = async function handler(req, res) {
  const send = (code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return send(500, { error: 'Stripe is not configured yet (STRIPE_SECRET_KEY missing).' });

  const b = req.body || {};
  if (!b.email || !b.pm) return send(400, { error: 'Email and card are required.' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const customer = await stripe.customers.create({
      email: b.email, name: b.name || undefined, phone: b.phone || undefined,
      address: b.address || undefined,
      metadata: { product: 'design-club', session: b.sessionId || '' },
    }, { idempotencyKey: `cus_${b.sessionId}` });

    const si = await stripe.setupIntents.create({
      customer: customer.id,
      usage: 'off_session',
      payment_method_types: ['card'],
      payment_method_options: { card: { request_three_secure_secure: 'any' } },
      metadata: { product: 'design-club', session: b.sessionId || '' },
    }, { idempotencyKey: `si_${b.sessionId}` });

    await pool.query(
      `UPDATE trials SET stripe_customer = $1, status = 'auth_pending' WHERE session_id = $2`,
      [customer.id, b.sessionId]
    );

    send(200, { setupSecret: si.client_secret });
  } catch (e) {
    console.error('club-trial', e);
    send(400, { error: e.message });
  }
};
