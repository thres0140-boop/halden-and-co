// Creates the Design Club membership (a monthly subscription) in Stripe and saves its
// price ID to stripe-prices.json as "design-club". Run: node scripts/stripe-design-club.js
// The 30-day free trial is set on each checkout (api/subscribe.js), not on the price.
const fs = require('fs');
const path = require('path');
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch {}
const Stripe = require('stripe');

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Add STRIPE_SECRET_KEY to .env first.'); process.exit(1); }
const stripe = Stripe(key);
const file = path.join(__dirname, '..', 'stripe-prices.json');
const ids = JSON.parse(fs.readFileSync(file, 'utf8'));

(async () => {
  console.log(`Stripe ${key.includes('_live_') ? 'LIVE' : 'TEST'} mode`);
  if (ids['design-club']) return console.log(`skip  Design Club  (${ids['design-club']})`);
  const product = await stripe.products.create({
    name: 'Halden & Co. Design Club',
    description: 'Monthly online interior design membership: personal styling advice, room plans and members-only offers. First month free, cancel anytime.',
    metadata: { shop_id: 'design-club', type: 'digital' },
    default_price_data: { currency: 'eur', unit_amount: 2900, recurring: { interval: 'month' } },
  });
  ids['design-club'] = product.default_price;
  fs.writeFileSync(file, JSON.stringify(ids, null, 2) + '\n');
  console.log(`made  Design Club  €29/month  ->  ${product.default_price}`);
})().catch(e => { console.error(e.message); process.exit(1); });
