// Local dev server: serves the shop and the /api/checkout endpoint.  Run: npm run dev
// (On Vercel you don't need this file: it serves the files and api/ automatically.)
const http = require('http');
const fs = require('fs');
const path = require('path');
try { process.loadEnvFile(require('path').join(__dirname, '.env')); } catch {} // reads STRIPE_SECRET_KEY from .env
const checkout = require('./api/checkout.js');
const subscribe = require('./api/subscribe.js');

const PORT = process.env.PORT || 4321;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const PUBLIC = ['index.html', 'styles.css', 'app.js', 'products.js', 'images.js', 'images'];

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/checkout') {
    let raw = ''; for await (const c of req) raw += c;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    return checkout(req, res);
  }
  if (url.pathname === '/api/subscribe') return subscribe(req, res);
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!PUBLIC.some(p => rel === p || rel.startsWith(p + '/')) || rel.includes('..')) { res.statusCode = 404; return res.end('Not found'); }
  fs.readFile(path.join(__dirname, rel), (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(rel)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => console.log(`Halden & Co. running on http://localhost:${PORT}  (Stripe ${process.env.STRIPE_SECRET_KEY ? (process.env.STRIPE_SECRET_KEY.includes('_live_') ? 'LIVE' : 'test') + ' mode' : 'NOT configured'})`));
