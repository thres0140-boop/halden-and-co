// Halden umbrella store — the three bundle "products" the checkout charges for.
// Colour choices (Black/Ivory/Smoke) per unit travel as metadata, not price, so one
// price per bundle size is all Stripe needs. Edit `price` here to change pricing.
const BUNDLES = [
  { id: 'halden-1', name: 'Halden Full-Body Umbrella — Single', units: 1, price: 49 },
  { id: 'halden-2', name: 'Halden Full-Body Umbrella — Duo',    units: 2, price: 79 },
  { id: 'halden-3', name: 'Halden Full-Body Umbrella — Trio',   units: 3, price: 99 },
];
const PRODUCTS = BUNDLES; // api/checkout.js reads { id, name, price }
if (typeof module !== 'undefined') module.exports = { PRODUCTS, BUNDLES };
