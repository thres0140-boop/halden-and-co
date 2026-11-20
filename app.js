/* Rainveil umbrella store — single page, hash router, i18n (ES/NL/DE). No build step. */

/* ============================ EDIT HERE ============================ */
const BRAND = 'RAINVEIL';                       // wordmark — change in one place
const OFFER_END = '2026-12-14T23:59:59';      // fixed offer end date (no reset on reload)
const SHIP = { min: 7, max: 15 };             // delivery window, business days
const UNIT = 49;                              // single-unit reference price (€)
const PRICES = { 1: 49, 2: 79, 3: 99 };       // bundle prices (€)
const BUNDLE_ID = { 1: 'rainveil-1', 2: 'rainveil-2', 3: 'rainveil-3' };
const COLORS = ['black', 'ivory', 'smoke'];
const SWATCH = { black: '#1c1c1c', ivory: '#e7e0d2', smoke: '#9a9a9a' };
const CONTACT = 'soporte@wearrainveil.com';
const AVAIL = ['black']; // colours in stock; others stay in COLORS, hidden until available
const MEDIA = {
  heroVideo: 'media/video/hero.mp4', heroPoster: 'media/video/hero-poster.jpg',
  gallery: ['01', '02', '03', '04', '05', '06', '07'], // media/gallery/NN.webp + .jpg
  swatch: { black: 'media/gallery/02' },
};
const STEP_PHOTOS = ['04', '06', '03']; // Ábrelo · La cortina cae · Camina seco
const CMP_THUMB = { reg: 'media/gallery/cmp-normal', brand: 'media/gallery/02' };
/* ================================================================== */
const pic = (base, alt, cls = '') => `<picture><source srcset="${base}.webp" type="image/webp"><img class="${cls}" src="${base}.jpg" alt="${alt}" loading="lazy"></picture>`;

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const SUPPORTED = ['es', 'nl', 'de'];
function navLang() { // best guess from the browser's own languages, no network
  const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
  for (const l of list) { const p = String(l).slice(0, 2).toLowerCase(); if (SUPPORTED.includes(p)) return p; }
  return 'es';
}
let LANG = localStorage.getItem('rainveil-lang');
let USER_SET = SUPPORTED.includes(LANG); // true only once the visitor picks a language themselves
if (!USER_SET) LANG = navLang();
const state = { units: 2, pick: ['black', 'black', 'black'], tab: 'inc', g: 0 };

/* ---------- money + dates ---------- */
const LOC = { es: 'es-ES', nl: 'nl-NL', de: 'de-DE' };
const eur = n => new Intl.NumberFormat(LOC[LANG], { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
const perUnit = u => PRICES[u] / u;
const saving = u => UNIT * u - PRICES[u];
function addBiz(date, n) { const d = new Date(date); let a = 0; while (a < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) a++; } return d; }
const fmtDate = d => new Intl.DateTimeFormat(LOC[LANG], { day: 'numeric', month: 'short' }).format(d);
const fmtLong = d => new Intl.DateTimeFormat(LOC[LANG], { day: 'numeric', month: 'long' }).format(d);

/* ---------- i18n ---------- */
const I = {
  es: {
    langName: 'ES',
    announce: d => `Envío gratis a España · Oferta hasta el <b>${d}</b>`,
    cart: 'Carrito',
    heroTitle: 'El paraguas que te mantiene seco de la cabeza a los pies',
    heroSub: 'Una cortina transparente cae desde la cúpula hasta el suelo. Caminas seco, veas donde pises.',
    benefits: ['Seco de la cabeza a los pies', 'Transparente en todo el contorno', 'Se pliega en su propia funda', 'Envío gratis'],
    from: 'desde', color: 'Color', colorNames: { black: 'Negro', ivory: 'Marfil', smoke: 'Humo' },
    bundleEyebrow: 'Pack y ahorro', bundleHead: 'Compra más, ahorra más',
    unitsName: u => `${u} ${u === 1 ? 'paraguas' : 'paraguas'}`,
    perUnitLbl: p => `${p} / unidad`, saveLbl: a => `Ahorras ${a}`,
    mostChosen: 'Más elegido', bestValue: 'Mejor precio',
    chooseEach: 'Elige un color para cada uno', unitLbl: n => `Unidad ${n}`,
    add: 'Añadir al carrito', freeShip: 'Envío gratis',
    cart: 'Tu carrito', cartEmpty: 'Tu carrito está vacío.', remove: 'Quitar', subtotal: 'Subtotal', pay: 'Finalizar compra', secure: 'Pago seguro', orderSummary: 'Resumen del pedido', processing: 'Procesando de forma segura…',
    trust: ['Envío gratis', '7–15 días hábiles', 'Pago seguro', 'Soporte por email'],
    tlOrdered: 'Pedido', tlSent: 'Enviado', tlDelivered: 'Entregado',
    tabs: { inc: 'Qué incluye', how: 'Cómo funciona', ship: 'Envío y devoluciones' },
    included: ['Paraguas de cuerpo entero Rainveil', 'Funda de transporte a juego', 'Instrucciones de uso'],
    howText: 'Ábrelo, deja caer la cortina transparente a tu alrededor y camina seco. La lluvia queda fuera, de la cabeza a los pies.',
    shipText: `Envío gratis a España, Países Bajos y Alemania en ${SHIP.min}–${SHIP.max} días hábiles. Devoluciones sin preguntas dentro de 30 días.`,
    stepsHead: 'Cómo funciona',
    steps: [['Ábrelo', 'Un gesto y la cúpula se despliega.'], ['La cortina cae', 'La cortina transparente desciende a tu alrededor.'], ['Camina seco', 'La lluvia queda fuera, de la cabeza a los pies.']],
    cmpHead: 'Un paraguas normal vs Rainveil', cmpReg: 'Paraguas normal',
    cmpRows: ['Cabeza seca', 'Ropa y bolso secos', 'Protege de salpicaduras', 'Bloquea la lluvia lateral', 'Transparente en todo el contorno', 'Se pliega compacto'],
    reelsHead: 'Míralo bajo la lluvia',
    finalTitle: 'No dejes que el próximo aguacero te empape', finalSub: 'Precio de oferta en todos los packs. Envío gratis.', finalCta: 'Consíguelo ahora',
    endsIn: 'La oferta termina en', cd: ['días', 'horas', 'min', 'seg'],
    faqHead: 'Preguntas frecuentes',
    faq: [
      ['¿Cómo funciona?', 'Al abrir el paraguas, una cortina transparente cae desde la cúpula hasta el suelo y te rodea por completo, de modo que la lluvia no te alcanza por ningún lado.'],
      ['¿Puedo ver a través de ella?', 'Sí. La cortina es totalmente transparente, así que ves con claridad hacia dónde caminas en todo momento.'],
      ['¿Qué talla tiene?', 'Es de tamaño adulto: la cúpula y la cortina cubren a una persona de pie, con ropa y bolso, hasta los pies.'],
      ['¿Aguanta el viento?', 'La estructura reforzada resiste la lluvia y el viento habituales. En temporal fuerte, recógelo como cualquier paraguas.'],
      ['¿Cuánto tarda el envío?', `Entre ${SHIP.min} y ${SHIP.max} días hábiles a España, Países Bajos y Alemania, con envío gratis.`],
      ['¿Puedo devolverlo?', 'Sí, dispones de 30 días para devolverlo. Si no te convence, te reembolsamos.'],
      ['¿Cómo lo guardo?', 'Se pliega y se desliza dentro de su propia funda, lista para el bolso o la mochila.'],
    ],
    footerLinks: { privacy: 'Privacidad', terms: 'Términos', refunds: 'Reembolsos', shipping: 'Envío', imprint: 'Aviso legal' },
    contactLine: 'Contacto', rights: 'Todos los derechos reservados.',
    successTitle: 'Gracias por tu pedido', successBody: 'Tu pago se ha realizado correctamente. Recibirás un correo de confirmación y el seguimiento en cuanto lo enviemos.',
    cancelTitle: 'Pago cancelado', cancelBody: 'No se ha cobrado nada. Tu selección sigue disponible.',
    back: 'Volver a la tienda', placeholder: 'Tu vídeo / imagen aquí', soon: 'Texto pendiente.',
  },
  nl: {
    langName: 'NL',
    announce: d => `Gratis verzending naar Nederland · Aanbieding t/m <b>${d}</b>`,
    cart: 'Winkelwagen',
    heroTitle: 'De paraplu die je van top tot teen droog houdt',
    heroSub: 'Een transparant gordijn valt van het scherm tot aan de grond. Je loopt droog en ziet precies waar je gaat.',
    benefits: ['Droog van top tot teen', 'Rondom transparant', 'Vouwt op in zijn eigen hoes', 'Gratis verzending'],
    from: 'vanaf', color: 'Kleur', colorNames: { black: 'Zwart', ivory: 'Ivoor', smoke: 'Rook' },
    bundleEyebrow: 'Pakket & korting', bundleHead: 'Meer kopen, meer besparen',
    unitsName: u => `${u} ${u === 1 ? 'paraplu' : "paraplu's"}`,
    perUnitLbl: p => `${p} / stuk`, saveLbl: a => `Bespaar ${a}`,
    mostChosen: 'Meest gekozen', bestValue: 'Beste prijs',
    chooseEach: 'Kies een kleur voor elk', unitLbl: n => `Stuk ${n}`,
    add: 'In winkelwagen', freeShip: 'Gratis verzending',
    cart: 'Je winkelwagen', cartEmpty: 'Je winkelwagen is leeg.', remove: 'Verwijderen', subtotal: 'Subtotaal', pay: 'Afrekenen', secure: 'Veilig betalen', orderSummary: 'Besteloverzicht', processing: 'Veilig verwerken…',
    trust: ['Gratis verzending', '7–15 werkdagen', 'Veilig betalen', 'Support via e-mail'],
    tlOrdered: 'Besteld', tlSent: 'Verzonden', tlDelivered: 'Bezorgd',
    tabs: { inc: 'Wat zit erin', how: 'Hoe het werkt', ship: 'Verzending & retour' },
    included: ['Rainveil paraplu voor het hele lichaam', 'Bijpassende draaghoes', 'Gebruiksaanwijzing'],
    howText: 'Open hem, laat het transparante gordijn om je heen zakken en loop droog. De regen blijft buiten, van top tot teen.',
    shipText: `Gratis verzending naar Spanje, Nederland en Duitsland in ${SHIP.min}–${SHIP.max} werkdagen. Retour binnen 30 dagen, zonder gedoe.`,
    stepsHead: 'Hoe het werkt',
    steps: [['Open hem', 'Eén beweging en het scherm klapt open.'], ['Het gordijn zakt', 'Het transparante gordijn zakt om je heen.'], ['Loop droog', 'De regen blijft buiten, van top tot teen.']],
    cmpHead: 'Een gewone paraplu vs Rainveil', cmpReg: 'Gewone paraplu',
    cmpRows: ['Hoofd droog', 'Kleding & tas droog', 'Beschermt tegen opspattend water', 'Blokkeert zijwaartse regen', 'Rondom transparant', 'Vouwt compact op'],
    reelsHead: 'Zie het in de regen',
    finalTitle: 'Laat de volgende bui je niet verrassen', finalSub: 'Aanbiedingsprijs op alle pakketten. Gratis verzending.', finalCta: 'Bestel nu',
    endsIn: 'Aanbieding eindigt over', cd: ['dagen', 'uren', 'min', 'sec'],
    faqHead: 'Veelgestelde vragen',
    faq: [
      ['Hoe werkt het?', 'Bij het openen valt een transparant gordijn van het scherm tot aan de grond en sluit het je volledig in, zodat de regen je nergens raakt.'],
      ['Kan ik er doorheen kijken?', 'Ja. Het gordijn is volledig transparant, dus je ziet steeds helder waar je loopt.'],
      ['Welke maat heeft het?', 'Formaat voor volwassenen: scherm en gordijn bedekken een staande persoon, met kleding en tas, tot aan de voeten.'],
      ['Bestand tegen wind?', 'De versterkte constructie weerstaat normale regen en wind. Bij storm vouw je hem in, net als elke paraplu.'],
      ['Hoe lang duurt de verzending?', `Tussen ${SHIP.min} en ${SHIP.max} werkdagen naar Spanje, Nederland en Duitsland, met gratis verzending.`],
      ['Kan ik retourneren?', 'Ja, je hebt 30 dagen om te retourneren. Niet tevreden? Dan krijg je je geld terug.'],
      ['Hoe berg ik hem op?', 'Hij vouwt op en glijdt in zijn eigen hoes, klaar voor je tas of rugzak.'],
    ],
    footerLinks: { privacy: 'Privacy', terms: 'Voorwaarden', refunds: 'Retour', shipping: 'Verzending', imprint: 'Colofon' },
    contactLine: 'Contact', rights: 'Alle rechten voorbehouden.',
    successTitle: 'Bedankt voor je bestelling', successBody: 'Je betaling is gelukt. Je ontvangt een bevestiging en de tracking zodra we verzenden.',
    cancelTitle: 'Betaling geannuleerd', cancelBody: 'Er is niets afgeschreven. Je selectie staat nog klaar.',
    back: 'Terug naar de winkel', placeholder: 'Jouw video / afbeelding hier', soon: 'Tekst volgt.',
  },
  de: {
    langName: 'DE',
    announce: d => `Kostenloser Versand nach Deutschland · Angebot bis <b>${d}</b>`,
    cart: 'Warenkorb',
    heroTitle: 'Der Schirm, der dich von Kopf bis Fuß trocken hält',
    heroSub: 'Ein transparenter Vorhang fällt vom Dach bis zum Boden. Du gehst trocken und siehst genau, wohin du trittst.',
    benefits: ['Trocken von Kopf bis Fuß', 'Rundum durchsichtig', 'Faltet sich in die eigene Hülle', 'Kostenloser Versand'],
    from: 'ab', color: 'Farbe', colorNames: { black: 'Schwarz', ivory: 'Elfenbein', smoke: 'Rauch' },
    bundleEyebrow: 'Set & Ersparnis', bundleHead: 'Mehr kaufen, mehr sparen',
    unitsName: u => `${u} ${u === 1 ? 'Schirm' : 'Schirme'}`,
    perUnitLbl: p => `${p} / Stück`, saveLbl: a => `Spare ${a}`,
    mostChosen: 'Am beliebtesten', bestValue: 'Bester Preis',
    chooseEach: 'Wähle eine Farbe für jeden', unitLbl: n => `Schirm ${n}`,
    add: 'In den Warenkorb', freeShip: 'Kostenloser Versand',
    cart: 'Dein Warenkorb', cartEmpty: 'Dein Warenkorb ist leer.', remove: 'Entfernen', subtotal: 'Zwischensumme', pay: 'Zur Kasse', secure: 'Sicher bezahlen', orderSummary: 'Bestellübersicht', processing: 'Sichere Verarbeitung…',
    trust: ['Kostenloser Versand', '7–15 Werktage', 'Sicherer Checkout', 'E-Mail-Support'],
    tlOrdered: 'Bestellt', tlSent: 'Versandt', tlDelivered: 'Geliefert',
    tabs: { inc: 'Lieferumfang', how: "So funktioniert's", ship: 'Versand & Rückgabe' },
    included: ['Rainveil Ganzkörper-Schirm', 'Passende Tragehülle', 'Gebrauchsanweisung'],
    howText: 'Öffnen, den transparenten Vorhang um dich herum fallen lassen und trocken gehen. Der Regen bleibt draußen, von Kopf bis Fuß.',
    shipText: `Kostenloser Versand nach Spanien, Niederlande und Deutschland in ${SHIP.min}–${SHIP.max} Werktagen. Rückgabe innerhalb von 30 Tagen, ohne Wenn und Aber.`,
    stepsHead: "So funktioniert's",
    steps: [['Öffnen', 'Eine Bewegung und das Dach öffnet sich.'], ['Der Vorhang fällt', 'Der transparente Vorhang gleitet um dich herum.'], ['Trocken gehen', 'Der Regen bleibt draußen, von Kopf bis Fuß.']],
    cmpHead: 'Ein normaler Schirm vs Rainveil', cmpReg: 'Normaler Schirm',
    cmpRows: ['Kopf trocken', 'Kleidung & Tasche trocken', 'Schutz vor Spritzwasser', 'Hält Regen von der Seite ab', 'Rundum durchsichtig', 'Faltet kompakt zusammen'],
    reelsHead: 'Sieh es im Regen',
    finalTitle: 'Lass dich vom nächsten Regen nicht überraschen', finalSub: 'Angebotspreis auf alle Sets. Kostenloser Versand.', finalCta: 'Jetzt sichern',
    endsIn: 'Angebot endet in', cd: ['Tage', 'Std', 'Min', 'Sek'],
    faqHead: 'Häufige Fragen',
    faq: [
      ['Wie funktioniert es?', 'Beim Öffnen fällt ein transparenter Vorhang vom Dach bis zum Boden und umschließt dich vollständig, sodass der Regen dich nirgends erreicht.'],
      ['Kann ich hindurchsehen?', 'Ja. Der Vorhang ist vollständig durchsichtig, du siehst jederzeit klar, wohin du gehst.'],
      ['Welche Größe hat er?', 'Erwachsenengröße: Dach und Vorhang bedecken eine stehende Person mit Kleidung und Tasche bis zu den Füßen.'],
      ['Hält er Wind aus?', 'Die verstärkte Konstruktion hält normalem Regen und Wind stand. Bei Sturm faltest du ihn ein, wie jeden Schirm.'],
      ['Wie lange dauert der Versand?', `Zwischen ${SHIP.min} und ${SHIP.max} Werktagen nach Spanien, Niederlande und Deutschland, kostenlos.`],
      ['Kann ich zurückgeben?', 'Ja, du hast 30 Tage Zeit für die Rückgabe. Nicht überzeugt? Du bekommst dein Geld zurück.'],
      ['Wie verstaue ich ihn?', 'Er faltet sich zusammen und gleitet in die eigene Hülle, bereit für Tasche oder Rucksack.'],
    ],
    footerLinks: { privacy: 'Datenschutz', terms: 'AGB', refunds: 'Rückgabe', shipping: 'Versand', imprint: 'Impressum' },
    contactLine: 'Kontakt', rights: 'Alle Rechte vorbehalten.',
    successTitle: 'Danke für deine Bestellung', successBody: 'Deine Zahlung war erfolgreich. Du erhältst eine Bestätigung und die Sendungsverfolgung, sobald wir versenden.',
    cancelTitle: 'Zahlung abgebrochen', cancelBody: 'Es wurde nichts abgebucht. Deine Auswahl steht weiterhin bereit.',
    back: 'Zurück zum Shop', placeholder: 'Dein Video / Bild hier', soon: 'Text folgt.',
  },
};
const t = k => I[LANG][k];

/* ---------- icons (thin line) ---------- */
const ico = {
  drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  sleeve: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v4h6V3"/>',
  truck: '<path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z"/><path d="M9 12l2 2 4-4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4Z"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  play: '<path d="M8 5l11 7-11 7Z"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h3l2.4 12h10L21 8H7"/>',
};
const svg = p => `<svg class="icn" viewBox="0 0 24 24">${p}</svg>`;

/* umbrella line illustration for placeholders */
function umbrella(tint) {
  const c = tint || '#c9bfa8';
  return `<svg viewBox="0 0 160 200" width="70%" style="max-width:150px" fill="none" stroke="#141414" stroke-width="1.3" aria-hidden="true">
    <path d="M18 70 Q80 6 142 70 Z" fill="${c}" stroke="#141414"/>
    <path d="M18 70 Q40 58 52 70 Q64 58 80 70 Q96 58 108 70 Q120 58 142 70" />
    <line x1="80" y1="70" x2="80" y2="150"/>
    <g stroke-dasharray="2 4" opacity=".7">
      <line x1="26" y1="72" x2="26" y2="176"/><line x1="46" y1="72" x2="46" y2="176"/>
      <line x1="66" y1="72" x2="66" y2="176"/><line x1="94" y1="72" x2="94" y2="176"/>
      <line x1="114" y1="72" x2="114" y2="176"/><line x1="134" y1="72" x2="134" y2="176"/>
    </g>
    <circle cx="80" cy="108" r="9"/><path d="M80 117 v26 M80 124 l-10 8 M80 124 l10 8 M80 143 l-8 14 M80 143 l8 14"/>
    <line x1="18" y1="176" x2="142" y2="176"/>
  </svg>`;
}
const frame = (cls, label) => `<div class="frame ${cls || ''}"><div style="position:absolute;inset:0;display:grid;place-items:center">${umbrella()}</div>${label ? `<div class="ph-label">${label}</div>` : ''}</div>`;

/* ---------- header / announce / footer / sticky ---------- */
function chrome() {
  const end = fmtLong(new Date(OFFER_END));
  $('#announce').innerHTML = I[LANG].announce(end);
  $('#header').innerHTML = `<div class="wrap">
    <a class="logo" href="#/">${BRAND}</a>
    <div class="header-right">
      <div class="lang">${['es', 'nl', 'de'].map(l => `<button data-lang="${l}" class="${l === LANG ? 'on' : ''}">${I[l].langName}</button>`).join('')}</div>
      <button class="cartbtn" id="goBuy" aria-label="${t('cart')}">${svg(ico.cart)}<span class="cart-count" id="cartCount">0</span></button>
    </div></div>`;
  $('#footer').innerHTML = `<div class="wrap">
    <div class="f-links">${Object.entries(t('footerLinks')).map(([k, v]) => `<a href="#/legal/${k}">${v}</a>`).join('')}</div>
    <div class="f-bottom"><span>${BRAND}</span><span>${t('contactLine')}: ${CONTACT}</span><span>© ${new Date().getFullYear()} ${BRAND}. ${t('rights')}</span></div>
  </div>`;
  document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  $('#goBuy').onclick = openCart;
  updateCartCount();
}
function setLang(l) { LANG = l; USER_SET = true; localStorage.setItem('rainveil-lang', l); document.documentElement.lang = l; chrome(); route(); }
async function detectGeo() { // refine language from the visitor's country (Vercel IP geo), unless they chose one
  if (USER_SET) return;
  try {
    const d = await (await fetch('/api/geo')).json();
    if (d && SUPPORTED.includes(d.lang) && d.lang !== LANG && !USER_SET) { LANG = d.lang; document.documentElement.lang = LANG; chrome(); route(); }
  } catch {}
}

/* ---------- sticky mobile bar ---------- */
function syncSticky(show) {
  const bar = $('#stickybar');
  if (!show) { bar.classList.remove('on'); return; }
  bar.innerHTML = `<span class="s-price">${eur(PRICES[state.units])}</span><button class="btn" id="stickyAdd">${t('add')}</button>`;
  $('#stickyAdd').onclick = addToCart;
  bar.classList.add('on');
}

/* ---------- home ---------- */
function home() {
  const b = t('benefits'); const benefitIcons = [ico.drop, ico.eye, ico.sleeve, ico.truck];
  app.innerHTML = `
  <section class="hero"><div class="wrap hero-grid">
    <div class="gallery" id="gallery"></div>
    <div class="buybox">
      <h1 class="p-title">${t('heroTitle')}</h1>
      <p style="color:var(--muted);margin-bottom:14px">${t('heroSub')}</p>
      <div class="p-price"><span class="now" id="price">${t('from')} ${eur(49)}</span></div>
      <ul class="benefits">${b.map((x, i) => `<li>${svg(benefitIcons[i])}<span>${x}</span></li>`).join('')}</ul>

      <div class="block"><div class="opt-label">${t('color')} <b id="colorName">${t('colorNames')[state.pick[0]]}</b></div>
        <div class="swatches" id="swatches">${AVAIL.map(c => `
          <button class="swatch ${c === state.pick[0] ? 'on' : ''}" data-c="${c}">
            <div class="sw-img">${MEDIA.swatch[c] ? pic(MEDIA.swatch[c], t('colorNames')[c]) : umbrella(SWATCH[c])}</div>
            <div class="sw-name">${t('colorNames')[c]}</div></button>`).join('')}</div>
      </div>

      <div class="block"><div class="opt-label" style="margin-bottom:4px">${t('bundleEyebrow')}</div>
        <div class="tiers" id="tiers">${[1, 2, 3].map(u => tierHTML(u)).join('')}</div></div>

      <div class="addwrap"><button class="btn" id="addBtn">${t('add')} · <span id="addPrice">${eur(PRICES[state.units])}</span></button>
        <div class="pays">${['Visa', 'Mastercard', 'Amex', 'Apple&nbsp;Pay', 'PayPal', 'iDEAL', 'Klarna'].map(p => `<span>${p}</span>`).join('')}</div>
        <div class="trust">${t('trust').map((x, i) => `<div>${svg([ico.truck, ico.check, ico.shield, ico.chat][i])}<span>${x}</span></div>`).join('')}</div>
        ${timelineHTML()}
      </div>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="tabs" id="tabs">${Object.entries(t('tabs')).map(([k, v]) => `<button data-tab="${k}" class="${k === state.tab ? 'on' : ''}">${v}</button>`).join('')}</div>
    <div class="tabpane" id="tabpane">${tabContent()}</div>
  </div></section>

  <section class="section"><div class="wrap"><div class="section-h"><div class="eyebrow">${BRAND}</div><h2>${t('stepsHead')}</h2></div>
    <div class="steps">${t('steps').map(([h, d], i) => `<div class="step"><div class="step-photo">${pic('media/gallery/' + STEP_PHOTOS[i], h)}</div><div class="num">${i + 1}</div><h3>${h}</h3><p>${d}</p></div>`).join('')}</div>
  </div></section>

  <section class="section"><div class="wrap"><div class="section-h"><h2>${t('cmpHead')}</h2></div>
    <div class="cmp">
      <div class="cmp-row head"><div class="c"></div><div class="c"><span class="cmp-thumb">${pic(CMP_THUMB.reg, t('cmpReg'))}</span>${t('cmpReg')}</div><div class="c brand"><span class="cmp-thumb">${pic(CMP_THUMB.brand, BRAND)}</span>${BRAND}</div></div>
      ${t('cmpRows').map((r, i) => `<div class="cmp-row"><div class="c">${r}</div><div class="c">${i === 0 ? svg(ico.check).replace('icn', 'icn no') : '<span class="no">—</span>'}</div><div class="c">${svg(ico.check).replace('icn', 'icn yes')}</div></div>`).join('')}
    </div>
  </div></section>

  <section class="section"><div class="wrap"><div class="section-h"><h2>${t('reelsHead')}</h2></div>
    <div class="reels">${[1, 2, 3, 4].map(n => `<div class="reel"><video class="reel-v" muted loop playsinline preload="none" poster="media/video/reel-${n}-poster.jpg" data-src="media/video/reel-${n}.mp4"></video></div>`).join('')}</div>
  </div></section>

  <section class="finalcta"><div class="eyebrow" style="color:var(--accent)">${t('endsIn')}</div>
    <div class="countdown" id="cd"></div>
    <h2>${t('finalTitle')}</h2><p>${t('finalSub')}</p>
    <button class="btn" id="finalBtn">${t('finalCta')}</button>
  </section>

  <section class="section"><div class="wrap"><div class="section-h"><h2>${t('faqHead')}</h2></div>
    <div class="faq">${t('faq').map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
  </div></section>`;

  // gallery
  $('#gallery').innerHTML = `<div class="g-main" id="gMain"></div><div class="g-thumbs" id="gThumbs"></div>`;
  renderGallery();

  bindHome();
  startCountdown();
  setupReels();
  syncSticky(true);
  observeSticky();
}

function renderGallery() {
  const items = [{ type: 'video' }, ...MEDIA.gallery.map(n => ({ type: 'img', n }))];
  const it = items[state.g] || items[0];
  $('#gMain').innerHTML = it.type === 'video'
    ? `<video class="g-media" src="${MEDIA.heroVideo}" poster="${MEDIA.heroPoster}" autoplay muted loop playsinline></video>`
    : `<div class="g-media">${pic('media/gallery/' + it.n, 'Rainveil')}</div>`;
  $('#gThumbs').innerHTML = items.map((x, i) => `<button class="g-thumb ${i === state.g ? 'on' : ''}" data-gi="${i}" aria-label="${i + 1}">${x.type === 'video'
    ? `<img src="${MEDIA.heroPoster}" alt=""><span class="g-play">${svg(ico.play)}</span>`
    : pic('media/gallery/' + x.n, '')}</button>`).join('');
  $('#gThumbs').querySelectorAll('[data-gi]').forEach(b => b.onclick = () => { state.g = +b.dataset.gi; renderGallery(); });
}

function setupReels() {
  const vids = document.querySelectorAll('.reel-v'); if (!vids.length) return;
  if (!('IntersectionObserver' in window)) { vids.forEach(v => { v.src = v.dataset.src; v.play?.().catch(() => {}); }); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play?.().catch(() => {}); }
    else v.pause?.();
  }), { threshold: 0.35 });
  vids.forEach(v => io.observe(v));
}

function tierHTML(u) {
  const flag = u === 2 ? `<span class="flag">${t('mostChosen')}</span>` : u === 3 ? `<span class="flag best">${t('bestValue')}</span>` : '';
  const sv = saving(u);
  return `<div class="tier ${u === state.units ? 'on' : ''}" data-u="${u}">
    ${flag}<span class="radio"></span>
    <div class="tier-top"><span class="tier-name">${t('unitsName')(u)}</span><span class="tier-price">${eur(PRICES[u])}</span></div>
    <div class="tier-sub"><span>${t('perUnitLbl')(eur(perUnit(u)))}</span>${sv > 0 ? `<span class="save">${t('saveLbl')(eur(sv))}</span>` : `<span>${t('freeShip')}</span>`}</div>
    <div class="unit-pickers ${u === state.units && u > 1 && AVAIL.length > 1 ? '' : 'hide'}" data-pickers="${u}">
      <div class="opt-label" style="margin:0">${t('chooseEach')}</div>
      ${Array.from({ length: u }, (_, n) => `<div class="unit-row"><div class="u-label">${t('unitLbl')(n + 1)}</div>
        <div class="u-dots">${AVAIL.map(c => `<button data-unit="${n}" data-color="${c}" class="${state.pick[n] === c ? 'on' : ''}"><span class="dot" style="background:${SWATCH[c]}"></span></button>`).join('')}</div></div>`).join('')}
    </div></div>`;
}

function timelineHTML() {
  const today = new Date();
  const steps = [[today, today, t('tlOrdered'), true], [addBiz(today, 1), addBiz(today, 2), t('tlSent'), false], [addBiz(today, SHIP.min), addBiz(today, SHIP.max), t('tlDelivered'), false]];
  return `<div class="timeline">${steps.map(([a, b, lbl, done]) => `<div class="tl-step ${done ? 'done' : ''}"><div class="tl-line"></div><div class="tl-dot"></div>
    <div class="tl-day">${a.getTime() === b.getTime() ? fmtDate(a) : fmtDate(a) + ' – ' + fmtDate(b)}</div><div class="tl-label">${lbl}</div></div>`).join('')}</div>`;
}

function tabContent() {
  if (state.tab === 'inc') return `<ul>${t('included').map(x => `<li>${svg(ico.check)}<span>${x}</span></li>`).join('')}</ul>`;
  if (state.tab === 'how') return `<p>${t('howText')}</p>`;
  return `<p>${t('shipText')}</p>`;
}

function bindHome() {
  document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { state.pick[0] = b.dataset.c; rerenderBuy(); });
  document.querySelectorAll('[data-u]').forEach(el => el.onclick = e => { if (e.target.closest('[data-unit]')) return; state.units = +el.dataset.u; rerenderBuy(); });
  document.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => { state.pick[+b.dataset.unit] = b.dataset.color; rerenderBuy(); });
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); $('#tabpane').innerHTML = tabContent(); });
  $('#addBtn').onclick = addToCart;
  $('#finalBtn').onclick = () => $('#tiers').scrollIntoView({ behavior: 'smooth' });
}

function rerenderBuy() {
  $('#colorName').textContent = t('colorNames')[state.pick[0]];
  document.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === state.pick[0]));
  $('#tiers').innerHTML = [1, 2, 3].map(u => tierHTML(u)).join('');
  $('#addPrice').textContent = eur(PRICES[state.units]);
  // rebind tier + unit handlers
  document.querySelectorAll('[data-u]').forEach(el => el.onclick = e => { if (e.target.closest('[data-unit]')) return; state.units = +el.dataset.u; rerenderBuy(); });
  document.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => { state.pick[+b.dataset.unit] = b.dataset.color; rerenderBuy(); });
  if ($('#stickybar').classList.contains('on')) syncSticky(true);
}

/* countdown in final CTA */
let cdTimer;
function startCountdown() {
  clearInterval(cdTimer);
  const el = $('#cd'); if (!el) return;
  const tick = () => {
    let s = Math.max(0, Math.floor((new Date(OFFER_END) - new Date()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
    const L = t('cd');
    el.innerHTML = [[d, L[0]], [h, L[1]], [m, L[2]], [s, L[3]]].map(([v, lbl]) => `<div class="cd"><b>${String(v).padStart(2, '0')}</b><span>${lbl}</span></div>`).join('');
  };
  tick(); cdTimer = setInterval(tick, 1000);
}

/* sticky bar: show once hero add button scrolled past, hide at footer */
function observeSticky() {
  const add = $('#addBtn'); if (!add) return;
  if (!('IntersectionObserver' in window)) { syncSticky(true); return; }
  const io = new IntersectionObserver(es => { const e = es[0]; syncSticky(e.boundingClientRect.top < 0 && !e.isIntersecting); }, { threshold: 0 });
  io.observe(add);
}

/* ---------- cart ---------- */
function loadCart() { try { return JSON.parse(localStorage.getItem('rainveil-cart') || 'null'); } catch { return null; } }
function saveCart(c) { try { c ? localStorage.setItem('rainveil-cart', JSON.stringify(c)) : localStorage.removeItem('rainveil-cart'); } catch {} updateCartCount(); }
function addToCart() { const units = state.units; const colors = state.pick.slice(0, units).map(c => t('colorNames')[c]); saveCart({ id: BUNDLE_ID[units], units, colors }); openCart(); }
function updateCartCount() { const c = loadCart(); const el = $('#cartCount'); if (el) { el.textContent = c ? c.units : 0; el.classList.toggle('on', !!c); } }
function openCart() { renderCartDrawer(); $('#cartDrawer').classList.add('on'); $('#overlay').classList.add('on'); }
function closeCart() { $('#cartDrawer').classList.remove('on'); $('#overlay').classList.remove('on'); }
function renderCartDrawer() {
  const c = loadCart(); const d = $('#cartDrawer');
  if (!c) {
    d.innerHTML = `<div class="cart-head"><span>${t('cart')}</span><button class="cart-x" id="cartClose" aria-label="close">✕</button></div>
      <div class="cart-body"><p class="cart-empty">${t('cartEmpty')}</p><a class="btn block" href="#/" id="cartShop">${BRAND}</a></div>`;
  } else {
    const price = PRICES[c.units];
    d.innerHTML = `<div class="cart-head"><span>${t('cart')}</span><button class="cart-x" id="cartClose" aria-label="close">✕</button></div>
      <div class="cart-body"><div class="cart-line">
        <div class="cart-thumb">${pic('media/gallery/02', 'Rainveil')}</div>
        <div class="cart-info"><h4>${t('unitsName')(c.units)}</h4><small>${c.colors.join(' · ')}</small><button class="cart-remove" id="cartRemove">${t('remove')}</button></div>
        <div class="cart-price">${eur(price)}</div></div></div>
      <div class="cart-foot"><div class="cart-sub"><span>${t('subtotal')}</span><strong>${eur(price)}</strong></div>
        <small class="cart-ship">${t('freeShip')}</small>
        <button class="btn block" id="cartCheckout">${t('pay')}</button></div>`;
  }
  const cl = $('#cartClose'); if (cl) cl.onclick = closeCart;
  const sh = $('#cartShop'); if (sh) sh.onclick = closeCart;
  const rm = $('#cartRemove'); if (rm) rm.onclick = () => { saveCart(null); renderCartDrawer(); };
  const co = $('#cartCheckout'); if (co) co.onclick = () => { closeCart(); location.hash = '#/checkout'; };
}

/* ---------- on-site checkout (Stripe Embedded Checkout) ---------- */
let _stripe, _embedded;
async function checkoutPage() {
  const c = loadCart(); if (!c) { location.hash = '#/'; return; }
  syncSticky(false);
  const price = PRICES[c.units];
  app.innerHTML = `<div class="checkout">
    <div class="co-summary"><a class="co-back" href="#/">← ${BRAND}</a><h2>${t('secure')}</h2>
      <div class="co-line"><div class="co-thumb">${pic('media/gallery/02', 'Rainveil')}</div>
        <div class="co-meta"><h4>${t('unitsName')(c.units)}</h4><small>${c.colors.join(' · ')}</small></div><div class="co-price">${eur(price)}</div></div>
      <div class="co-total"><span>${t('subtotal')}</span><strong>${eur(price)}</strong></div>
      <div class="co-total"><span>${t('freeShip')}</span><strong>€0</strong></div>
      <div class="co-total co-grand"><span>Total</span><strong>${eur(price)}</strong></div></div>
    <div class="co-pay"><div id="checkout"><p class="co-processing">${t('processing')}</p></div></div></div>`;
  let pk = null;
  try { pk = (await (await fetch('/api/config')).json()).publishableKey; } catch {}
  if (!pk || !window.Stripe) return fallbackCheckout(c);
  try {
    if (_embedded) { try { _embedded.destroy(); } catch {} _embedded = null; }
    _stripe = window.Stripe(pk);
    _embedded = await _stripe.initEmbeddedCheckout({
      fetchClientSecret: async () => {
        const r = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, colors: c.colors }) });
        const d = await r.json(); if (!r.ok || !d.clientSecret) throw new Error(d.error || 'session'); return d.clientSecret;
      },
    });
    const el = $('#checkout'); if (!el) return; el.innerHTML = '';
    _embedded.mount('#checkout');
  } catch (e) { fallbackCheckout(c); }
}
// until the live keys are added, use the existing hosted checkout so the store keeps selling
async function fallbackCheckout(c) {
  const el = $('#checkout'); if (el) el.innerHTML = `<p class="co-processing">${t('processing')}</p>`;
  try {
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: c.id, color: c.colors.join(' + '), qty: 1 }] }) });
    const d = await r.json().catch(() => ({})); if (r.ok && d.url) { location.href = d.url; return; }
  } catch {}
  if (el) el.innerHTML = `<p class="co-processing">${t('soon')}</p>`;
}

/* ---------- success page ---------- */
async function successPage() {
  const params = new URLSearchParams(((location.hash.split('?')[1] || '') + '&' + (location.search.slice(1) || '')).replace(/^&|&$/g, ''));
  const sid = params.get('session_id') || params.get('session');
  saveCart(null); syncSticky(false);
  const fmt = a => new Intl.NumberFormat(LOC[LANG], { style: 'currency', currency: 'EUR' }).format((a || 0) / 100);
  app.innerHTML = `<div class="page"><h1>${t('successTitle')}</h1><p>${t('successBody')}</p>
    <div id="orderSummary"></div>
    <p><a class="btn ghost" style="display:inline-block;width:auto;padding:12px 24px" href="#/">${t('back')}</a></p></div>`;
  if (!sid) return;
  try {
    const s = await (await fetch('/api/session-status?session_id=' + encodeURIComponent(sid))).json();
    if (s && s.amount_total != null) {
      $('#orderSummary').innerHTML = `<div class="ordsum"><div class="ordsum-h">${t('orderSummary')}</div>
        ${(s.items || []).map(i => `<div class="ordsum-row"><span>${(i.name || '').replace(/</g, '')} × ${i.qty}</span><strong>${fmt(i.amount)}</strong></div>`).join('')}
        <div class="ordsum-row ordsum-total"><span>Total</span><strong>${fmt(s.amount_total)}</strong></div>
        ${s.email ? `<div class="ordsum-row"><span>${String(s.email).replace(/</g, '')}</span></div>` : ''}</div>`;
    }
  } catch {}
}

function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2800); }

/* ---------- legal + order pages ---------- */
function legal(slug) {
  const title = (t('footerLinks'))[slug] || slug;
  app.innerHTML = `<div class="page"><h1>${title}</h1><p><em>${t('soon')}</em></p>
    <p>${t('contactLine')}: ${CONTACT}</p><p><a class="btn ghost" style="display:inline-block;width:auto;padding:12px 24px" href="#/">${t('back')}</a></p></div>`;
  syncSticky(false);
}
function orderPage(ok) {
  app.innerHTML = `<div class="page"><h1>${ok ? t('successTitle') : t('cancelTitle')}</h1><p>${ok ? t('successBody') : t('cancelBody')}</p>
    <p><a class="btn ghost" style="display:inline-block;width:auto;padding:12px 24px" href="#/">${t('back')}</a></p></div>`;
  syncSticky(false);
}

/* ---------- router ---------- */
function route() {
  clearInterval(cdTimer);
  const parts = (location.hash || '#/').slice(1).split('?')[0].split('/').filter(Boolean);
  if (parts[0] === 'legal') legal(parts[1]);
  else if (parts[0] === 'checkout') checkoutPage();
  else if (parts[0] === 'order' && (parts[1] || '').startsWith('success')) successPage();
  else if (parts[0] === 'order') orderPage(false);
  else home();
  if (parts[0]) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
document.documentElement.lang = LANG;
$('#overlay').onclick = closeCart;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
chrome();
route();
detectGeo();
