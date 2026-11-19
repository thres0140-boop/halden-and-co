// Creates the 3 umbrella bundle prices in Stripe (live) and writes their IDs into
// stripe-prices.json. Safe to re-run: bundles already linked are skipped.
const fs = require('fs'); const path = require('path');
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch {}
const Stripe = require('stripe');
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Add STRIPE_SECRET_KEY to .env'); process.exit(1); }
const stripe = Stripe(key);
const { BUNDLES } = require('../products.js');
const file = path.join(__dirname, '..', 'stripe-prices.json');
const ids = JSON.parse(fs.readFileSync(file, 'utf8'));
(async () => {
  console.log(`Stripe ${key.includes('_live_') ? 'LIVE' : 'TEST'} mode`);
  for (const b of BUNDLES) {
    if (ids[b.id]) { console.log(`skip  ${b.name} (${ids[b.id]})`); continue; }
    const p = await stripe.products.create({
      name: b.name,
      description: `${b.units} Halden full-body rain umbrella${b.units > 1 ? 's' : ''}. Free shipping.`,
      metadata: { shop_id: b.id, units: String(b.units) },
      default_price_data: { currency: 'eur', unit_amount: Math.round(b.price * 100) },
    });
    ids[b.id] = p.default_price;
    fs.writeFileSync(file, JSON.stringify(ids, null, 2) + '\n');
    console.log(`made  ${b.name}  €${b.price}  ->  ${p.default_price}`);
  }
  console.log('Done.');
})().catch(e => { console.error(e.message); process.exit(1); });
