// Catalogue: product names, descriptions, colours and prices (EUR) shown on the site.
// Supplier details for fulfilment are kept server-side only (api/_supplier.json, not in git).
// To change pricing, edit `price` (and `was` for sale items).
// Photos per colour live in images.js / images/.
// To change pricing, edit `price` (and `was` for sale items). Prices are in EUR.

const COLORS = {
  "Oatmeal":"#d9ccb4","Grey":"#8d8f93","Black":"#1c1c1c","Green":"#6f8a5a","Forest Green":"#2f4a35",
  "Emerald":"#1f5c4a","Royal Blue":"#2c4a8c","Rust":"#a2512f",
  "Oak":"#c49a6c","Walnut":"#5c3b26","Walnut Grey":"#6b5a4e","Beige":"#e2d6c2","Coffee":"#6b4a33","Gold":"#c9a54c","Silver":"#c0c0c4"
};

const PRODUCTS = [
  // Sofa beds
  {id:"flow-79-sofa-bed", name:"The Flow 79 Sofa Bed", type:"sofabed", cat:"sofabeds", fit:"200 × 100 × 70 cm · 4-in-1",
   price:1545, was:1895, colors:["Grey","Green","Forest Green","Royal Blue","Rust"],
   material:"Breathable corduroy over 50D high-density, high-resilience foam. Frameless construction", tags:["sale","bestsellers"],
   desc:"A low, frameless sofa that unfolds four ways: sofa, lounger, chaise and guest bed. Deep corduroy channels and a 150 cm wide seat make it as comfortable for an afternoon nap as for an overnight guest."},

  // Modular sectionals
  {id:"cnest-108-modular-sectional", name:"The CNest 108 Modular Sectional", type:"sectional", cat:"modular", fit:"274 cm wide · seats 3–5 · 2 ottomans",
   price:2195, colors:["Oatmeal","Grey","Black","Forest Green"],
   material:"Plush corduroy over all-foam, high-density seat modules. No frame, no springs", tags:["new","bestsellers"],
   desc:"An oversized, all-foam sectional built from modules you arrange yourself: one long sofa, an L-shape or a conversation pit. Two ottomans included. Deep, soft seating that sits low and looks sculptural."},
  {id:"cnest-135-modular-sectional", name:"The CNest 135 Modular Sectional", type:"sectional", cat:"modular", fit:"343 cm wide · seats 4–5 · deep seat",
   price:2495, colors:["Grey","Black","Forest Green"],
   material:"Plush corduroy over all-foam, high-density seat modules. No frame, no springs", tags:["new"],
   desc:"Our largest sectional: 3.4 metres of deep, cloud-like seating for open-plan living rooms. Fully modular, so it moves with you from room to room and home to home."},

  // Chaise sectionals
  {id:"cnest-107-right-chaise-sectional", name:"The CNest 107 Chaise Sectional, Right", type:"chaise", cat:"chaise", fit:"272 cm wide · right-facing chaise",
   price:1950, was:2450, colors:["Oatmeal","Grey","Black","Emerald"],
   material:"Corduroy over all-foam, high-density modules. No frame, no springs", tags:["sale","bestsellers"],
   desc:"An L-shaped boneless sofa with a deep chaise on the right. Low-slung, generous and soft, with modules you can rearrange as your room changes."},
  {id:"cnest-107-left-chaise-sectional", name:"The CNest 107 Chaise Sectional, Left", type:"chaise", cat:"chaise", fit:"272 cm wide · left-facing chaise",
   price:1850, colors:["Oatmeal","Black"],
   material:"Corduroy over all-foam, high-density modules. No frame, no springs", tags:["new"],
   desc:"The CNest 107 with its chaise on the left. A relaxed, sculptural shape that anchors a living room and invites you to stretch out."},

  // Sofas
  {id:"mayfair-velvet-chesterfield-sofa", name:"The Mayfair Velvet Chesterfield", type:"sofa", cat:"sofas", fit:"211 cm wide · seats 3",
   price:2295, colors:["Grey","Black"],
   material:"Soft velvet upholstery, button tufting with nailhead trim, clear acrylic legs. Two matching throw pillows included", tags:["new","bestsellers"],
   desc:"A mid-century take on the classic Chesterfield. Deep button tufting and nailhead detailing meet slim acrylic legs, so the sofa appears to float. A statement piece for a living room, study or office."},
  {id:"cloud-112-l-sectional", name:"The Cloud 112 L-Sectional", type:"sectional", cat:"sofas", fit:"285 cm wide · seats 3 · movable ottoman",
   price:2450, colors:["Beige","Grey","Coffee","Green"],
   material:"Soft-touch upholstery over deep, cloud-like cushions. Movable ottoman that works as a chaise or footrest", tags:["new"],
   desc:"A generous, cloud-soft L-shaped sofa with full armrests and a movable ottoman. Set the chaise left or right, or pull the ottoman out as a footrest."},

  // Dining
  {id:"aldo-extendable-dining-table", name:"The Aldo Extendable Dining Table", type:"table", cat:"dining", fit:"45–300 cm long · seats 2–12",
   price:2150, colors:["Oak","Walnut"],
   material:"Wood-grain finished table top with stored extension leaves", tags:["new"],
   desc:"A table that grows with the occasion: a slim console for everyday, extending to three metres for twelve guests. The extension leaves store neatly inside the frame."},
  {id:"walnut-seven-piece-dining-set", name:"The Walnut Seven-Piece Dining Set", type:"set", cat:"dining", fit:"Table + 6 chairs · seats 6",
   price:2350, was:2850, colors:["Walnut"],
   material:"Walnut-brown table with six upholstered faux leather chairs", tags:["sale","bestsellers"],
   desc:"A complete dining room in one: a warm walnut table and six upholstered faux leather chairs. Classic, comfortable and made for long dinners."},
  {id:"verona-expandable-dining-set", name:"The Verona Expandable Dining Set", type:"set", cat:"dining", fit:"160–200 cm table + 6 leather chairs",
   price:1995, colors:["Oak","Walnut Grey"],
   material:"Expandable wooden table with six leather-look upholstered chairs", tags:["bestsellers"],
   desc:"An expandable dining table and six leather chairs. Seats six comfortably every day, and extends for when the family comes over."},
  {id:"mermaid-dining-chairs-pair", name:"The Mermaid Dining Chairs, Set of 2", type:"chair", cat:"dining", fit:"Set of 2 · armless side chairs",
   price:1595, colors:["Black","Beige"],
   material:"Channel-tufted PU leather seat and back on sturdy metal legs", tags:["new"],
   desc:"Scalloped, shell-shaped dining chairs with channel tufting and slender metal legs. Mix them around a table, or use a pair as a sculptural accent."},
  // Lighting
  {id:"spiral-sculpture-table-lamps-pair", name:"The Spiral Sculpture Table Lamps, Set of 2", type:"lamp", cat:"lighting", fit:"41 cm tall · 14 cm base · set of 2",
   price:19.99, colors:["Gold","Black"],
   material:"Matte-painted aluminium spiral on a solid steel base. Flicker-free LED, dimmable, three colour temperatures (3000–6000K) with memory", tags:["new"],
   desc:"A sculptural spiral of light. Each lamp glows from warm to cool white and dims smoothly from an inline touch switch, remembering your last setting. Beautiful in pairs on a sideboard, desk or either side of the bed."},
  {id:"orbit-five-ring-chandelier", name:"The Orbit Five-Ring Chandelier", type:"light", cat:"lighting", fit:"80 cm diameter \u00b7 5 tiered rings \u00b7 for high ceilings",
   price:995, colors:["Black"],
   material:"Matte metal rings with continuous LED. Dimmable with remote control, adjustable suspension cables", tags:["new", "bestsellers"],
   desc:"Five rings of light, tiered and suspended at different heights. Made for double-height entrances, stairwells and open living rooms, where it reads as a sculpture by day and a glowing halo by night."},
  {id:"orbit-three-ring-chandelier", name:"The Orbit Three-Ring Chandelier", type:"light", cat:"lighting", fit:"Three tiered rings \u00b7 adjustable height",
   price:695, colors:["Black", "Silver"],
   material:"Metal rings with continuous LED. Dimmable with remote control, adjustable cables", tags:["new"],
   desc:"Three rings of soft, even light that can hang close together or cascade. Over a dining table, in a living room or above a staircase, it brings a quietly dramatic focal point."},
  {id:"halo-80-ring-chandelier", name:"The Halo 80 Ring Chandelier", type:"light", cat:"lighting", fit:"80 cm diameter \u00b7 single statement ring",
   price:795, colors:["Black", "Silver"],
   material:"Slim metal ring with continuous LED. Dimmable with remote control", tags:["new"],
   desc:"A single, oversized ring of light for entrance halls and high ceilings. Minimal in form, generous in scale."},
  {id:"duo-ring-chandelier", name:"The Duo Ring Chandelier", type:"light", cat:"lighting", fit:"60 cm diameter \u00b7 two rings",
   price:549, colors:["Gold"],
   material:"Brushed gold metal rings with continuous LED. Dimmable", tags:["bestsellers"],
   desc:"Two interlocking golden rings that float above the dining table. Warm, dimmable light and a silhouette that feels like jewellery for the room."},
  {id:"linea-dining-pendant", name:"The Linea Dining Pendant", type:"light", cat:"lighting", fit:"Linear pendant \u00b7 made for over the table",
   price:395, colors:["Black", "Gold"],
   material:"Metal frame with integrated dimmable LED. Adjustable suspension", tags:["new"],
   desc:"A long, sculptural pendant drawn to sit over a dining table or kitchen island, spreading soft, even light along its length."},
  {id:"mirror-line-vanity-light", name:"The Mirror Line Vanity Light", type:"light", cat:"lighting", fit:"124 cm wide \u00b7 over-mirror wall light",
   price:249, colors:["Gold", "Black"],
   material:"Slim metal bar with integrated LED, for bathrooms and dressing rooms", tags:["new"],
   desc:"A long, slender line of light to hang above a mirror. Even, flattering illumination for the bathroom or dressing room."},
  {id:"arc-wall-sconce", name:"The Arc Wall Sconce", type:"light", cat:"lighting", fit:"Wall light \u00b7 dimmable \u00b7 remote control",
   price:149, colors:["Gold", "Black", "Silver"],
   material:"Metal with integrated LED. Dimmable with remote control", tags:["bestsellers"],
   desc:"A sculptural wall light that washes the wall with a soft glow. Use a pair either side of the bed, a sofa or a mirror."},
  {id:"petite-halo-pendant", name:"The Petite Halo Pendant", type:"light", cat:"lighting", fit:"30 cm diameter \u00b7 pendant with remote",
   price:89, colors:["Gold", "Black"],
   material:"Metal ring with integrated LED. Dimmable with remote control", tags:["new"],
   desc:"A small ring of light for kitchen islands, hallways and bedside corners. Hang one alone or several in a row."},
];

const CATEGORIES = [
  {key:"modular", label:"Modular Sectionals"},
  {key:"chaise", label:"Chaise Sectionals"},
  {key:"sofas", label:"Sofas"},
  {key:"sofabeds", label:"Sofa Beds"},
  {key:"dining", label:"Dining"},
  {key:"lighting", label:"Lighting"},
];

// Lets the checkout server (api/checkout.js) read the same catalogue.
if (typeof module !== 'undefined') module.exports = { PRODUCTS, CATEGORIES };
