// GET /api/geo -> { country, lang }. Country comes from Vercel's IP geolocation header.
// lang is set only for our markets; the client keeps its own guess when lang is null.
module.exports = function handler(req, res) {
  const c = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  const map = { ES: 'es', NL: 'nl', DE: 'de', BE: 'nl', AT: 'de', LU: 'de', CH: 'de' };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ country: c || null, lang: map[c] || null }));
};
