// Stores completed orders in Postgres (Neon). Table is created on first use.
const { neon } = require('@neondatabase/serverless');
let ready;
function db() { if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing'); return neon(process.env.DATABASE_URL); }
async function saveOrder(o) {
  const sql = db();
  if (!ready) ready = sql`CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY, created_at timestamptz DEFAULT now(),
    email text, phone text, name text,
    amount_total integer, currency text,
    bundle text, units integer, colors text,
    shipping text, status text)`;
  await ready;
  await sql`INSERT INTO orders (id,email,phone,name,amount_total,currency,bundle,units,colors,shipping,status)
    VALUES (${o.id},${o.email},${o.phone},${o.name},${o.amount_total},${o.currency},${o.bundle},${o.units},${o.colors},${o.shipping},${o.status})
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`;
}
module.exports = { saveOrder };
