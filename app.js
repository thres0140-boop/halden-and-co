/* Halden & Co. storefront: hash router, product art, cart. No build step needed. */
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const eur = n => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 });
const FREE_SHIP = 125;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/* ---------- product illustrations (original SVG, no third-party photos) ---------- */
const SHAPES = {
  long: 'M112 72 L80 82 L50 112 L34 268 L62 274 L80 158 L82 344 L218 344 L220 158 L238 274 L266 268 L250 112 L220 82 L188 72 Q150 98 112 72Z',
  short: 'M112 72 L80 82 L42 142 L76 166 L86 144 L84 344 L216 344 L214 144 L224 166 L258 142 L220 82 L188 72 Q150 98 112 72Z',
  trouser: 'M96 52 L204 52 L224 362 L170 362 L150 142 L130 362 L76 362Z',
  short_b: 'M96 92 L204 92 L222 248 L162 248 L150 170 L138 248 L78 248Z',
  tank: 'M118 70 L100 76 Q98 132 86 152 L84 344 L216 344 L214 152 Q202 132 200 76 L182 70 Q150 104 118 70Z',
};
const typeShape = { polo: 'short', tee: 'short', shirt: 'long', tunic: 'long', henley: 'long', sweater: 'long', cardigan: 'long', overshirt: 'long', trouser: 'trouser', jogger: 'trouser', short: 'short_b', tank: 'tank' };
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f)))); return `rgb(${c})`; };
const isLight = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) > 150; };

function details(p, col) {
  const line = isLight(col) ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.22)';
  const d = [];
  if (['polo', 'shirt', 'overshirt'].includes(p.type)) d.push(`<path d="M112 72 L132 112 L150 90 L168 112 L188 72" fill="${shade(col, .92)}" stroke="${line}" stroke-width="1.5"/>`);
  if (['shirt', 'overshirt', 'cardigan'].includes(p.type)) { d.push(`<line x1="150" y1="92" x2="150" y2="344" stroke="${line}" stroke-width="1.5"/>`); for (let y = 120; y < 340; y += 40) d.push(`<circle cx="156" cy="${y}" r="2.6" fill="${line}"/>`); }
  if (['polo', 'henley'].includes(p.type)) { d.push(`<line x1="150" y1="92" x2="150" y2="150" stroke="${line}" stroke-width="1.5"/>`); [108, 126, 144].forEach(y => d.push(`<circle cx="155" cy="${y}" r="2.4" fill="${line}"/>`)); }
  if (p.type === 'tank') d.push(`<path d="M136 86 L150 140 L164 86" fill="none" stroke="${line}" stroke-width="1.5"/><path d="M141 102 L159 102 M144 118 L156 118" stroke="${line}" stroke-width="1.2"/>`);
  if (p.embroidery) d.push(`<path d="M118 84 Q130 120 142 166 M182 84 Q170 120 158 166" fill="none" stroke="${isLight(col) ? '#7a5c3e' : '#d8c08e'}" stroke-width="3" stroke-dasharray="1 4" stroke-linecap="round"/>`);
  if (p.type === 'jogger') d.push(`<path d="M150 60 V142" stroke="${line}" stroke-width="1.5"/><rect x="84" y="190" width="34" height="40" rx="3" fill="none" stroke="${line}" stroke-width="1.5"/><rect x="182" y="190" width="34" height="40" rx="3" fill="none" stroke="${line}" stroke-width="1.5"/><path d="M78 346 H128 M172 346 H222" stroke="${line}" stroke-width="8" stroke-dasharray="2 3"/><path d="M98 58 H202" stroke="${line}" stroke-width="8" stroke-dasharray="2 3"/>`);
  if (p.type === 'short') d.push(`<rect x="84" y="170" width="30" height="34" rx="3" fill="none" stroke="${line}" stroke-width="1.5"/><rect x="186" y="170" width="30" height="34" rx="3" fill="none" stroke="${line}" stroke-width="1.5"/>`);
  if (p.type === 'tunic') d.push(`<path d="M132 84 L150 160 L168 84" fill="none" stroke="${line}" stroke-width="1.5"/><path d="M138 104 L162 104 M141 120 L159 120 M144 136 L156 136" stroke="${line}" stroke-width="1.2"/>`);
  if (p.type === 'overshirt') d.push(`<rect x="96" y="140" width="40" height="44" fill="none" stroke="${line}" stroke-width="1.5"/><rect x="164" y="140" width="40" height="44" fill="none" stroke="${line}" stroke-width="1.5"/>`);
  if (['sweater', 'cardigan'].includes(p.type)) { d.push(`<path d="M84 330 H216" stroke="${line}" stroke-width="10" stroke-dasharray="2 3"/>`); if (p.type === 'sweater') d.push(`<path d="M118 76 Q150 104 182 76" fill="none" stroke="${line}" stroke-width="6" stroke-dasharray="2 3"/>`); }
  if (p.type === 'trouser') d.push(`<path d="M150 60 V142 M100 66 L138 66" stroke="${line}" stroke-width="1.5" fill="none"/><path d="M122 100 L126 340 M178 100 L174 340" stroke="${line}" stroke-width="1" opacity=".6"/>`);
  if (p.type === 'short') d.push(`<path d="M150 100 V170" stroke="${line}" stroke-width="1.5"/><path d="M118 92 Q150 104 182 92" fill="none" stroke="${line}" stroke-width="1.2"/>`);
  return d.join('');
}

let uid = 0;
function garmentSVG(p, colorName, bg = '#ece7df', scale = 1, par = 'xMidYMid slice') {
  const col = COLORS[colorName] || '#888';
  const id = 'g' + (uid++);
  const stripe = p.stripe ? `<pattern id="${id}s" width="300" height="22" patternUnits="userSpaceOnUse"><rect width="300" height="22" fill="${col}"/><rect y="14" width="300" height="5" fill="${isLight(col) ? '#1f2a44' : '#efe8da'}" opacity=".85"/></pattern>` : '';
  const fill = p.stripe ? `url(#${id}s)` : col;
  const tf = `translate(150 205) scale(${scale}) translate(-150 -205)`;
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="${par}" width="100%" height="100%">
    <defs>${stripe}
      <radialGradient id="${id}b" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${shade(bg.startsWith('#') ? bg : '#ece7df', 1.04)}"/><stop offset="1" stop-color="${shade(bg.startsWith('#') ? bg : '#ece7df', .9)}"/></radialGradient>
      <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#${id}b)"/>
    <ellipse cx="150" cy="372" rx="92" ry="9" fill="#000" opacity=".08"/>
    <g transform="${tf}">
      <path d="${SHAPES[typeShape[p.type]]}" fill="${fill}"/>
      ${details(p, col)}
      <path d="${SHAPES[typeShape[p.type]]}" fill="url(#${id}l)"/>
    </g></svg>`;
}

/* ---------- product photos ---------- */
PRODUCTS.forEach(p => { const im = (typeof IMAGES !== 'undefined' && IMAGES[p.id]) || null; if (!im) return; p.images = im;
  p.colors = [...p.colors.filter(c => im[c]), ...Object.keys(im).filter(c => !p.colors.includes(c))]; });
const photos = (p, color) => (p.images && (p.images[color] || p.images[p.colors[0]])) || null;
const pic = (src, alt, cls = '') => `<img class="photo ${cls}" src="${src}" alt="${alt}" loading="lazy">`;
// photo when we have one, otherwise the drawn illustration
const art = (p, color, n = 0, bg, scale, par) => { const ph = photos(p, color); return ph ? pic(ph[n % ph.length], `${p.name} in ${color}`) : garmentSVG(p, color, bg, scale, par); };

/* ---------- cart state ---------- */
let cart = JSON.parse(localStorage.getItem('halden-cart') || '[]');
const byId = id => PRODUCTS.find(p => p.id === id);
const saveCart = () => { localStorage.setItem('halden-cart', JSON.stringify(cart)); renderCart(); };
const cartTotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
function addToCart(id, color, size) {
  const hit = cart.find(i => i.id === id && i.color === color && i.size === size);
  hit ? hit.qty++ : cart.push({ id, color, size, qty: 1 });
  saveCart(); openDrawer('cart');
}

/* ---------- shared UI ---------- */
const ANNOUNCE = ['<b>Winter sale</b> · up to €500 off selected sofas', 'Free delivery on every order', 'Interior design advice — free with every order', 'The CNest 135 — <b>just landed</b>'];
(function announce() {
  const t = $('#announce'); t.innerHTML = [...ANNOUNCE, ANNOUNCE[0]].map(a => `<div>${a}</div>`).join('');
  let i = 0; setInterval(() => { i++; t.style.transition = 'transform .6s ease'; t.style.transform = `translateY(-${i * 34}px)`;
    if (i === ANNOUNCE.length) setTimeout(() => { t.style.transition = 'none'; t.style.transform = 'none'; i = 0; }, 650); }, 3800);
})();

$('#topnav').innerHTML = `<a class="sale" href="#/shop/sale">Sale</a><a href="#/shop/new">New arrivals</a><a href="#/shop/bestsellers">Bestsellers</a><a href="#/shop/all">Shop all</a>`;
$('#menuDrawer').innerHTML = `
  <div class="drawer-head"><span>Menu</span><button data-close>Close ✕</button></div>
  <div class="drawer-body">
    <div class="menu-group"><a href="#/shop/sale" style="color:var(--sale)">Sale</a><a href="#/shop/new">New arrivals</a><a href="#/shop/bestsellers">Bestsellers</a><a href="#/club">Design Club</a></div>
    <div class="menu-group small"><h5>Furniture</h5>${CATEGORIES.map(c => `<a href="#/shop/${c.key}">${c.label}</a>`).join('')}<a href="#/shop/all">Shop all</a></div>
    <div class="menu-group small"><h5>Client services</h5><a href="#/page/shipping">Shipping</a><a href="#/page/returns">Returns</a><a href="#/page/faq">FAQ</a><a href="#/page/contact">Contact</a></div>
    <div class="menu-promos">
      <a href="#/shop/new" style="background:#4b4a2f">NEW IN</a>
      <a href="#/shop/bestsellers" style="background:#1f2a44">BESTSELLERS</a>
    </div>
  </div>`;

function openDrawer(which) { $('#' + which + 'Drawer').classList.add('open'); $('#overlay').classList.add('on'); }
function closeDrawers() { document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open')); $('#overlay').classList.remove('on'); }
$('#menuBtn').onclick = () => openDrawer('menu');
$('#cartBtn').onclick = () => openDrawer('cart');
$('#overlay').onclick = closeDrawers;
document.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('.drawer a')) closeDrawers(); });
document.addEventListener('keydown', e => e.key === 'Escape' && closeDrawers());
$('#searchBtn').onclick = () => { $('#searchBar').classList.toggle('open'); $('#searchInput').focus(); };
$('#searchInput').addEventListener('input', e => { location.hash = '#/search/' + encodeURIComponent(e.target.value); });
$('#newsletterForm').onsubmit = e => { e.preventDefault(); e.target.reset(); toast('Thanks — you\'re on the list.'); };

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); }

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = count;
  const total = cartTotal(), left = Math.max(0, FREE_SHIP - total);
  $('#cartDrawer').innerHTML = `
    <div class="drawer-head"><span>Your cart (${count})</span><button data-close>Close ✕</button></div>
    <div class="drawer-body">${cart.length ? cart.map((i, n) => { const p = byId(i.id); return `
      <div class="cart-item"><div class="thumb">${art(p, i.color)}</div>
        <div><h6>${p.name}</h6><small>${i.color}${i.size && i.size !== 'Standard' ? ' · ' + i.size : ''}</small>
          <div class="qty"><button data-q="${n}" data-d="-1">−</button><span>${i.qty}</span><button data-q="${n}" data-d="1">+</button></div></div>
        <div style="text-align:right">${eur(p.price * i.qty)}<br><button class="remove" data-rm="${n}">Remove</button></div></div>`; }).join('')
      : '<p class="empty">Your cart is empty.</p><a href="#/shop/all" class="btn block">Continue shopping</a>'}</div>
    ${cart.length ? `<div class="cart-foot">
      <small>${left ? `You're ${eur(left)} away from free shipping` : 'Free delivery included'}</small>
      <div class="ship-bar"><i style="width:${Math.min(100, total / FREE_SHIP * 100)}%"></i></div>
      <div class="row" style="margin-bottom:14px"><span>Subtotal</span><strong>${eur(total)}</strong></div>
      <button class="btn block" id="checkoutBtn">Checkout</button></div>` : ''}`;
  $('#cartDrawer').querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const i = cart[b.dataset.q]; i.qty += +b.dataset.d; if (i.qty < 1) cart.splice(b.dataset.q, 1); saveCart(); });
  $('#cartDrawer').querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { cart.splice(b.dataset.rm, 1); saveCart(); });
  const co = $('#checkoutBtn'); if (co) co.onclick = async () => {
    co.disabled = true; co.textContent = 'Redirecting to secure checkout…';
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart }) });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.url) return void (location.href = data.url);
      toast(data.error || 'Checkout is unavailable right now.');
    } catch { toast('Checkout is unavailable right now.'); }
    co.disabled = false; co.textContent = 'Checkout';
  };
}

/* ---------- product card ---------- */
function priceHTML(p) {
  if (p.was) return `<div class="price"><s>${eur(p.was)}</s><span class="now">${eur(p.price)}</span><span class="deal">Save ${eur(p.was - p.price)}</span></div>`;
  return `<div class="price">${eur(p.price)}${p.cat === 'tops' ? '<span class="deal">2 for ' + eur(Math.round(p.price * 1.6)) + '</span>' : ''}</div>`;
}
function card(p) {
  const badges = [p.was && '<span class="badge sale">Sale</span>', p.tags.includes('new') && '<span class="badge">New</span>'].filter(Boolean).join('');
  return `<a class="card" href="#/product/${p.id}">
    <div class="img"><div class="badges">${badges}</div>
      <div class="art">${art(p, p.colors[0])}</div>
      <div class="art alt">${photos(p, p.colors[0]) ? art(p, p.colors[0], 1) : garmentSVG(p, p.colors[1] || p.colors[0], '#e3ddd3', 1.08)}</div>
      <span class="quick">View product</span></div>
    <div class="swatches">${p.colors.map(c => `<i title="${c}" style="background:${COLORS[c] || '#999'}"></i>`).join('')}</div>
    <h3>${p.name}</h3><div class="fit">${p.fit}</div>${priceHTML(p)}</a>`;
}

/* ---------- views ---------- */
const scene = (p, color, bg, pos = 'xMidYMid') => `<div class="bg" style="background:radial-gradient(circle at 60% 40%, ${bg}, ${bg}dd)">${photos(p, color) ? `<div class="scene-photo">${pic(photos(p, color)[0], p.name)}</div>` : garmentSVG(p, color, bg, .8, pos + ' meet')}</div>`;

function home() {
  const slides = [
    { p: byId('cnest-135-modular-sectional'), c: 'Grey', bg: '#5a5843', k: 'New in', h: 'The CNest 135', t: 'Three and a half metres of deep, modular seating.', l: '#/product/cnest-135-modular-sectional' },
    { p: byId('cnest-107-right-chaise-sectional'), c: 'Oatmeal', bg: '#3b4250', k: 'Winter sale', h: 'Up to €500 off', t: 'Selected chaise sectionals and sofa beds.', l: '#/shop/sale' },
    { p: byId('cnest-108-modular-sectional'), c: 'Forest Green', bg: '#8c6e52', k: 'Bestsellers', h: 'Sofas you sink into', t: 'Our most-loved modular sectionals, in every colour.', l: '#/shop/bestsellers' },
  ];
  app.innerHTML = `
  <section class="hero">${slides.map((s, i) => `<div class="slide ${i ? '' : 'on'}">${scene(s.p, s.c, s.bg, 'xMaxYMid')}
      <div class="content"><small>${s.k}</small><h1>${s.h}</h1><p>${s.t}</p><a class="btn light" href="${s.l}">Shop now</a></div></div>`).join('')}
    <div class="hero-dots">${slides.map((_, i) => `<button class="${i ? '' : 'on'}" data-s="${i}"></button>`).join('')}</div></section>

  <section class="statement"><small>Halden &amp; Co. — est. 2026</small><h2>The art of living well</h2>
    <p>Considered furniture for homes that are lived in. Sculptural, deeply comfortable pieces, chosen and placed with an interior designer's eye.</p></section>

  <div class="features">
    <div><h4>Luxe corduroy</h4><p>Soft, pet-friendly upholstery that ages beautifully.</p></div>
    <div><h4>High-density foam</h4><p>Supportive comfort that keeps its shape.</p></div>
    <div><h4>Fully modular</h4><p>Rearrange your sofa as your room changes.</p></div>
    <div><h4>Design advice</h4><p>Free interior styling with every order. <a href="#/club" style="text-decoration:underline">Join the Design Club</a> for more.</p></div>
  </div>

  <section class="section"><div class="section-head"><h2>New arrivals</h2>
    <div class="tabs" id="naTabs">${['All', 'Sofas', 'Dining', 'Sofa beds', 'Lighting'].map((t, i) => `<button class="${i ? '' : 'on'}" data-t="${t}">${t}</button>`).join('')}</div>
    <a href="#/shop/new">View all</a></div><div class="carousel" id="naGrid"></div></section>

  <section class="section" style="padding-top:0"><div class="section-head"><h2>Shop by room</h2></div>
    <div class="tiles">${[['modular', 'cnest-108-modular-sectional', 'Oatmeal', '#9b8b74'], ['chaise', 'cnest-107-left-chaise-sectional', 'Black', '#4a5560'], ['sofas', 'mayfair-velvet-chesterfield-sofa', 'Grey', '#5d4a3a'], ['dining', 'walnut-seven-piece-dining-set', 'Walnut', '#a9a196']]
      .map(([cat, id, c, bg]) => `<a class="tile" href="#/shop/${cat}">${scene(byId(id), c, bg)}<span>${CATEGORIES.find(x => x.key === cat).label} →</span></a>`).join('')}</div></section>

  <section class="split"><div class="bg">${art(byId('flow-79-sofa-bed'), 'Forest Green', 0, '#cbbfae', .8)}</div>
    <div class="txt"><small style="letter-spacing:.2em;font-size:11px;text-transform:uppercase;color:var(--muted)">The guest room edit</small>
      <h2>A sofa by day, a bed by night</h2><p>The Flow 79 unfolds four ways, so a study or small living room can welcome overnight guests.</p>
      <div><a class="btn" href="#/shop/sofabeds">Shop sofa beds</a></div></div></section>

  <section class="section"><div class="section-head"><h2>Bestsellers</h2><a href="#/shop/bestsellers">Shop now</a></div>
    <div class="grid">${PRODUCTS.filter(p => p.tags.includes('bestsellers')).slice(0, 8).map(card).join('')}</div></section>`;

  // hero rotation
  let s = 0; const go = n => { s = n; app.querySelectorAll('.slide').forEach((el, i) => el.classList.toggle('on', i === s)); app.querySelectorAll('.hero-dots button').forEach((el, i) => el.classList.toggle('on', i === s)); };
  app.querySelectorAll('.hero-dots button').forEach(b => b.onclick = () => go(+b.dataset.s));
  clearInterval(window._hero); window._hero = setInterval(() => document.body.contains(app.querySelector('.hero')) ? go((s + 1) % slides.length) : clearInterval(window._hero), 6000);

  // new arrival tabs
  const groups = { All: () => true, Sofas: p => ['modular', 'chaise', 'sofas'].includes(p.cat), Dining: p => p.cat === 'dining', 'Sofa beds': p => p.cat === 'sofabeds', Lighting: p => p.cat === 'lighting' };
  const fill = t => { $('#naGrid').innerHTML = PRODUCTS.filter(p => (t === 'All' ? p.tags.includes('new') : true) && groups[t](p)).map(card).join('') || '<p class="empty">Coming soon.</p>'; };
  $('#naTabs').querySelectorAll('button').forEach(b => b.onclick = () => { $('#naTabs .on').classList.remove('on'); b.classList.add('on'); fill(b.dataset.t); });
  fill('All');
}

function collection(key, query) {
  const special = { all: ['Shop all', 'The full Halden &amp; Co. collection.'], new: ['New arrivals', 'Just landed.'], bestsellers: ['Bestsellers', 'Our most-loved pieces.'], sale: ['Sale', 'Limited time — while stock lasts.'] };
  let list, title, sub;
  if (query !== undefined) { const q = query.toLowerCase(); list = PRODUCTS.filter(p => (p.name + p.cat + p.type + p.colors.join(' ')).toLowerCase().includes(q)); title = 'Search'; sub = query ? `Results for “${query}”` : 'Type to search'; }
  else if (special[key]) { [title, sub] = special[key]; list = key === 'all' ? PRODUCTS : key === 'sale' ? PRODUCTS.filter(p => p.was) : PRODUCTS.filter(p => p.tags.includes(key)); }
  else { const c = CATEGORIES.find(c => c.key === key); title = c ? c.label : 'Not found'; sub = ''; list = PRODUCTS.filter(p => p.cat === key); }
  app.innerHTML = `<div class="coll-head"><h1>${title}</h1><p>${sub}</p>
    <div class="chips"><a href="#/shop/all" class="${key === 'all' ? 'on' : ''}">All</a>${CATEGORIES.map(c => `<a href="#/shop/${c.key}" class="${key === c.key ? 'on' : ''}">${c.label}</a>`).join('')}</div></div>
    <div class="toolbar"><span>${list.length} products</span><label>Sort <select id="sort"><option value="feat">Featured</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option><option value="az">A–Z</option></select></label></div>
    <section class="section" style="padding-top:0"><div class="grid" id="cgrid"></div></section>`;
  const draw = mode => { const l = [...list]; if (mode === 'low') l.sort((a, b) => a.price - b.price); if (mode === 'high') l.sort((a, b) => b.price - a.price); if (mode === 'az') l.sort((a, b) => a.name.localeCompare(b.name));
    $('#cgrid').innerHTML = l.map(card).join('') || '<p class="empty" style="grid-column:1/-1">No products found.</p>'; };
  $('#sort').onchange = e => draw(e.target.value); draw('feat');
}

function product(id) {
  const p = byId(id); if (!p) return notFound();
  const sizes = p.sizes || []; let color = p.colors[0], size = sizes.length ? null : 'Standard';
  const soldOut = new Set(sizes.length ? [sizes[p.id.length % sizes.length]] : []);
  const draw = () => {
    app.innerHTML = `<div class="pdp">
      <div class="gallery">${photos(p, color) ? photos(p, color).map(src => `<div>${pic(src, p.name + ' in ' + color)}</div>`).join('') : [[1, '#ece7df'], [1.25, '#e4ded4'], [.8, '#d9d2c6']].map(([s, bg]) => `<div>${garmentSVG(p, color, bg, s)}</div>`).join('')}</div>
      <div class="info">
        <div class="crumbs"><a href="#/">Home</a> / <a href="#/shop/${p.cat}">${CATEGORIES.find(c => c.key === p.cat).label}</a></div>
        <h1>${p.name}</h1><div class="fit" style="color:var(--muted);font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin-top:6px">${p.fit}</div>
        ${priceHTML(p)}
        <div class="opt-label">Colour <span>${color}</span></div>
        <div class="color-opts">${p.colors.map(c => `<button title="${c}" data-c="${c}" class="${c === color ? 'on' : ''}" style="background:${COLORS[c] || '#999'}"></button>`).join('')}</div>
        ${sizes.length ? `<div class="opt-label">Size <span>${size || 'Select a size'}</span></div>
        <div class="size-opts">${sizes.map(s => `<button data-s="${s}" class="${s === size ? 'on' : ''}" ${soldOut.has(s) ? 'disabled' : ''}>${s}</button>`).join('')}</div>` : ''}
        <div class="add-row"><button class="btn block" id="addBtn">${size ? 'Add to cart — ' + eur(p.price) : 'Select a size'}</button></div>
        <div class="perks"><span>✓ Free delivery to your room of choice</span><span>✓ Free interior styling advice</span><span>✓ 30-day returns</span><span>✓ Pay in 3 interest-free instalments</span></div>
        <div class="acc">
          <details open><summary>Description</summary><p>${p.desc}</p></details>
          <details><summary>Dimensions</summary><p>${p.fit}.${['modular', 'chaise', 'sofabeds'].includes(p.cat) ? ' Each module arrives compressed in its own box and expands to full size within 24–72 hours.' : p.cat === 'lighting' ? (p.type === 'lamp' ? ' Arrives ready to use: just plug in.' : ' Hardwired fitting with mounting hardware included. We recommend installation by a qualified electrician.') : ' Delivered flat-packed with step-by-step assembly instructions.'}</p></details>
          <details><summary>Materials &amp; care</summary><p>${p.material ? p.material + '. ' : ''}${p.cat === 'lighting' ? 'Switch off and let it cool before cleaning. Dust with a soft, dry cloth; never use water or sprays on the light.' : p.cat === 'dining' ? 'Wipe with a soft, damp cloth and dry straight away. Use coasters and placemats. Keep out of strong direct sunlight.' : 'Vacuum regularly with a soft brush. Spot clean with a damp cloth and mild soap. Keep out of strong direct sunlight.'}</p></details>
          <details><summary>Delivery &amp; returns</summary><p>Free delivery, usually within 5–10 working days. Returns accepted within 30 days in the original packaging.</p></details>
        </div>
      </div></div>
      <section class="section"><div class="section-head"><h2>You may also like</h2></div>
        <div class="grid">${PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter(x => x.cat !== p.cat && x.tags.includes('bestsellers'))).slice(0, 4).map(card).join('')}</div></section>`;
    app.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { color = b.dataset.c; draw(); });
    app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { size = b.dataset.s; draw(); });
    $('#addBtn').onclick = () => size ? addToCart(p.id, color, size) : toast('Please select a size');
  };
  draw();
}

const PAGES = {
  about: ['Our story', 'Halden & Co. is an interior design studio and furniture house. We choose deeply comfortable, sculptural pieces and help you place them, so every room feels finished.'],
  shipping: ['Delivery', 'Free delivery on every order. Sofas ship in compact, compressed boxes and usually arrive within 5–10 working days across the EU, UK and US.'],
  returns: ['Returns', 'Changed your mind? Return unused items in their original packaging within 30 days for a full refund. Start your return from your account or the returns portal.'],
  faq: ['FAQ', 'How big is each sofa? See the Dimensions tab on every product, or ask us for a free room plan. Can I pay later? Yes, split your payment into 3 interest-free instalments at checkout.'],
  contact: ['Contact', 'Our client services team is here Monday to Saturday, 9:00–18:00. Email hello@haldenandco.example and we\'ll reply within one working day.'],
  care: ['Materials & care', 'Vacuum corduroy with a soft brush, spot clean gently and rotate cushions regularly so the foam wears evenly.'],
  careers: ['Careers', 'We\'re a small team of designers who care about how homes feel. No open positions right now — check back soon.'],
};
const page = slug => { const [h, t] = PAGES[slug] || ['Page not found', '']; app.innerHTML = `<div class="page"><h1>${h}</h1><p>${t}</p><a class="btn outline" href="#/shop/all">Continue shopping</a></div>`; };
const notFound = () => page('missing');
const account = () => { app.innerHTML = `<div class="page"><h1>Account</h1><p>Sign-in isn't connected yet. Connect an auth provider to enable customer accounts and order history.</p><a class="btn outline" href="#/shop/all">Continue shopping</a></div>`; };

/* ---------- Design Club (digital membership, 30-day free trial) ---------- */
function designClub(welcome) {
  if (welcome) { app.innerHTML = `<div class="page"><h1>Welcome to the Design Club</h1><p>Your free month has started. We'll email you within one working day to book your first styling session. Your card won't be charged until your trial ends, and you can cancel any time before then.</p><a class="btn outline" href="#/shop/all">Shop the collection</a></div>`; return; }
  const perks = [
    ['Personal styling', 'A one-to-one video session with a Halden &amp; Co. interior designer every month.'],
    ['Room plans', 'A made-to-measure layout and moodboard for one room each month, with pieces placed to scale.'],
    ['Members-only prices', 'Early access to new arrivals and private offers across sofas, dining and lighting.'],
    ['Ask us anything', 'Message our design team any time about colours, fabrics, lighting and layout.'],
  ];
  app.innerHTML = `
  <section class="club-hero"><small>Digital membership</small><h1>The Design Club</h1>
    <p>Your own interior designer, online. Personal styling, room plans and members-only prices, every month.</p>
    <div class="club-price"><strong>First month free</strong><span>then ${eur(29)} / month · cancel anytime</span></div>
    <button class="btn" id="trialBtn">Start your free month</button>
    <p class="club-note">Card required. You won't be charged for 30 days, and you can cancel before the trial ends.</p></section>
  <div class="features">${perks.map(([h, t]) => `<div><h4>${h}</h4><p>${t}</p></div>`).join('')}</div>
  <section class="statement"><small>How it works</small><h2>Start today, pay nothing for 30 days</h2>
    <p>Start your trial and we'll book your first styling session within one working day. After 30 days your membership continues at ${eur(29)} a month. Cancel at any time.</p></section>`;
  $('#trialBtn').onclick = async e => {
    const b = e.currentTarget; b.disabled = true; b.textContent = 'One moment…';
    try {
      const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const d = await r.json(); if (!r.ok || !d.url) throw new Error(d.error || 'Something went wrong');
      location.href = d.url;
    } catch (err) { toast(err.message); b.disabled = false; b.textContent = 'Start your free month'; }
  };
}

/* ---------- router ---------- */
function route() {
  const [, a, b] = (location.hash || '#/').slice(1).split('?')[0].split('/');
  if (!a) home();
  else if (a === 'shop') collection(b || 'all');
  else if (a === 'search') collection('', decodeURIComponent(b || ''));
  else if (a === 'product') product(b);
  else if (a === 'page') page(b);
  else if (a === 'account') account();
  else if (a === 'club') designClub((b || '').startsWith('welcome'));
  else if (a === 'order' && (b || '').startsWith('success')) { cart = []; saveCart(); app.innerHTML = `<div class="page"><h1>Thank you for your order</h1><p>Your payment was successful. A confirmation email is on its way, and we'll send tracking details as soon as your order ships.</p><a class="btn outline" href="#/shop/all">Continue shopping</a></div>`; }
  else if (a === 'order') { app.innerHTML = `<div class="page"><h1>Checkout cancelled</h1><p>No payment was taken. Your items are still in your cart.</p><button class="btn" onclick="openDrawer('cart')">View cart</button></div>`; }
  else notFound();
  if (a !== 'search') { window.scrollTo(0, 0); $('#searchBar').classList.remove('open'); }
}
window.addEventListener('hashchange', route);
renderCart(); route();
