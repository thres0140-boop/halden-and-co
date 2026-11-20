// Rainveil umbrella store — the three bundle "products" the checkout charges for.
// Colour choices (Black/Ivory/Smoke) per unit travel as metadata, not price, so one
// price per bundle size is all Stripe needs. Edit `price` here to change pricing.
const BUNDLES = [
  { id: 'rainveil-1', name: 'Rainveil Full-Body Umbrella — Single', units: 1, price: 49 },
  { id: 'rainveil-2', name: 'Rainveil Full-Body Umbrella — Duo',    units: 2, price: 79 },
  { id: 'rainveil-3', name: 'Rainveil Full-Body Umbrella — Trio',   units: 3, price: 99 },
];
const PRODUCTS = BUNDLES; // api/checkout.js reads { id, name, price }
if (typeof module !== 'undefined') module.exports = { PRODUCTS, BUNDLES };
