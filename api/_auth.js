const crypto = require('crypto');
const SECRET = process.env.ADMIN_SECRET || '';
const TTL = 12 * 3600 * 1000;

const sign = exp => crypto.createHmac('sha256', SECRET).update(String(exp)).digest('base64url');
const isLocal = req => /^(localhost|127\.0\.0\.1)$/.test((req.headers.host || '').split(':')[0]);

function cookie(req, value, maxAge) {
  const parts = [`admin=${value}`, 'HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`];
  if (!isLocal(req)) parts.push('Secure');
  return parts.join('; ');
}

const issue = req => {
  const exp = Date.now() + TTL;
  return cookie(req, `${exp}.${sign(exp)}`, TTL / 1000);
};
const clear = req => cookie(req, '', 0);

function isAdmin(req) {
  const raw = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('admin='));
  if (!raw) return false;
  const [exp, sig] = decodeURIComponent(raw.slice(6)).split('.');
  if (!exp || !sig || Date.now() > +exp) return false;
  const want = sign(exp);
  if (sig.length !== want.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want)); } catch { return false; }
}

function passwordOk(given) {
  const want = process.env.ADMIN_PASSWORD || '';
  if (!want || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { issue, clear, isAdmin, passwordOk };
