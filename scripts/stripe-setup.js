// Creates every shop product + its price in YOUR Stripe account and saves the price IDs
// to stripe-prices.json (shop product id -> Stripe price id).  Run: npm run stripe:setup
// Safe to run again: products already linked are skipped. If you change a price in
// products.js, delete that line from stripe-prices.json and run this again.
// Optional: SITE_URL=https://yourshop.com  -> also uploads product photos to Stripe.
const fs = require('fs');
const path = require('path');
try { process.loadEnvFile(require('path').join(__dirname, '..', '.env')); } catch {}
const Stripe = require('stripe');
const { PRODUCTS } = require('../products.js');
let SUPPLIER = {}; try { SUPPLIER = require('../api/_supplier.json'); } catch {}

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Add STRIPE_SECRET_KEY to .env first (see .env.example).'); process.exit(1); }
const stripe = Stripe(key);
const file = path.join(__dirname, '..', 'stripe-prices.json');
const ids = JSON.parse(fs.readFileSync(file, 'utf8'));

// first photo per product, for Stripe's checkout page (only if the site is online)
let IMAGES = {};
try { const s = fs.readFileSync(path.join(__dirname, '..', 'images.js'), 'utf8'); IMAGES = JSON.parse(s.slice(s.indexOf('=') + 1, s.lastIndexOf(';'))); } catch {}
const site = (process.env.SITE_URL || '').replace(/\/$/, '');

(async () => {
  console.log(`Stripe ${key.includes('_live_') ? 'LIVE' : 'TEST'} mode\n`);
  for (const p of PRODUCTS) {
    if (ids[p.id]) { console.log(`skip  ${p.name}  (${ids[p.id]})`); continue; }
    const firstColour = IMAGES[p.id] && Object.values(IMAGES[p.id])[0];
    const product = await stripe.products.create({
      name: p.name,
      description: p.desc,
      images: site && firstColour ? [`${site}/${firstColour[0]}`] : undefined,
      metadata: { shop_id: p.id, ref: (SUPPLIER[p.id] && Object.values(SUPPLIER[p.id].asins || {})[0]) || '', category: p.cat },
      default_price_data: { currency: 'eur', unit_amount: Math.round(p.price * 100) },
    });
    ids[p.id] = product.default_price;
    fs.writeFileSync(file, JSON.stringify(ids, null, 2) + '\n');
    console.log(`made  ${p.name}  €${p.price}  ->  ${product.default_price}`);
  }
  console.log('\nDone. Price IDs saved in stripe-prices.json');
})().catch(e => { console.error(e.message); process.exit(1); });
