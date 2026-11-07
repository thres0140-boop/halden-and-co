const crypto = require('crypto');
const KEY = Buffer.from(process.env.PAN_KEY || '', 'hex');

function seal(plain) {
  if (!plain || KEY.length !== 32) return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv.toString('base64'), c.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}

function open(sealed) {
  if (!sealed) return null;
  const [iv, tag, data] = sealed.split('.');
  const d = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8');
}

module.exports = { seal, open };
