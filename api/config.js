// GET /api/config -> { publishableKey }. Publishable keys are safe to expose.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null }));
};
