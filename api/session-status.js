// GET /api/session-status?session_id=... -> order summary for the success page
const Stripe = require('stripe');
module.exports = async (req, res) => {
  const send = (c, b) => { res.statusCode = c; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); };
  if (!process.env.STRIPE_SECRET_KEY) return send(500, { error: 'not configured' });
  const id = new URL(req.url, 'http://x').searchParams.get('session_id');
  if (!id) return send(400, { error: 'missing session_id' });
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const s = await stripe.checkout.sessions.retrieve(id, { expand: ['line_items'] });
    send(200, {
      status: s.status, payment_status: s.payment_status,
      email: s.customer_details && s.customer_details.email,
      amount_total: s.amount_total, currency: s.currency, metadata: s.metadata,
      items: ((s.line_items && s.line_items.data) || []).map(li => ({ name: li.description, qty: li.quantity, amount: li.amount_total })),
    });
  } catch (e) { send(500, { error: e.message }); }
};
