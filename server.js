// Local dev server. Run: npm run dev
const http = require('http');
const fs = require('fs');
const path = require('path');
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch {}

const routes = {
  '/api/checkout': () => require('./api/checkout.js'),
  '/api/subscribe': () => require('./api/subscribe.js'),
  '/api/club-trial': () => require('./api/club-trial.js'),
  '/api/collect': () => require('./api/collect.js'),
  '/api/admin': () => require('./api/admin.js'),
  '/api/admin-login': () => require('./api/admin-login.js'),
  '/api/stripe-webhook': () => require('./api/stripe-webhook.js'),
};
const RAW = new Set(['/api/stripe-webhook']);

const PORT = process.env.PORT || 4321;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.txt': 'text/plain' };
const PUBLIC = ['index.html', 'styles.css', 'app.js', 'products.js', 'images.js', 'images',
  'trial.html', 'trial.js', 'trial.css', 'admin.html', 'admin.js', 'admin.css', 'robots.txt'];
const ALIAS = { '/trial': 'trial.html', '/admin': 'admin.html' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const handler = routes[url.pathname];
  if (handler) {
    let raw = ''; for await (const c of req) raw += c;
    if (RAW.has(url.pathname)) req.body = raw;
    else { try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; } }
    return handler()(req, res);
  }
  const rel = ALIAS[url.pathname] || (url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, ''));
  if (!PUBLIC.some(p => rel === p || rel.startsWith(p + '/')) || rel.includes('..')) { res.statusCode = 404; return res.end('Not found'); }
  fs.readFile(path.join(__dirname, rel), (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(rel)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => console.log(`Halden & Co. on http://localhost:${PORT}  (Stripe ${process.env.STRIPE_SECRET_KEY ? (process.env.STRIPE_SECRET_KEY.includes('_live_') ? 'LIVE' : 'test') + ' mode' : 'NOT configured'})`));
