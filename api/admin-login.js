const { issue, clear, passwordOk } = require('./_auth');

module.exports = async function handler(req, res) {
  const send = (code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  if (req.method === 'POST') {
    if (!process.env.ADMIN_PASSWORD) return send(500, { error: 'ADMIN_PASSWORD is not set.' });
    if (!passwordOk((req.body || {}).password)) return send(401, { error: 'Wrong password.' });
    res.setHeader('Set-Cookie', issue(req));
    return send(200, { ok: true });
  }
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', clear(req)); return send(200, { ok: true }); }
  send(405, { error: 'Method not allowed' });
};
