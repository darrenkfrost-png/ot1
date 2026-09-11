/**
 * CONTACT DELIVERY AUDIT — the one path launch day depends on, proved against
 * the built server rather than assumed from the source.
 *
 *   node scripts/audit-contact.mjs        (after npm run build; part of npm run gates)
 *
 * The contact form delivers each enquiry to CONTACT_WEBHOOK_URL. That route
 * had never been exercised before launch was being planned around it, so this
 * runs the real dist/server.cjs against a stand-in email service on this
 * machine and checks every outcome a patient can meet: delivered, refused,
 * unreachable, not configured, and bad input.
 *
 * IT CAN NEVER TOUCH THE REAL INBOX. The server loads .env with dotenv, and a
 * developer's .env may hold the clinic's real webhook. dotenv never overrides a
 * variable that is already set, so every server started here is given
 * CONTACT_WEBHOOK_URL explicitly — the local stand-in, or an empty string for
 * the "not configured" case.
 */
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverFile = join(root, 'dist', 'server.cjs');
if (!existsSync(serverFile)) {
  console.error('dist/server.cjs is missing — run `npm run build` first.');
  process.exit(1);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });

const children = [];
async function startServer(webhook) {
  const port = await freePort();
  const child = spawn(process.execPath, [serverFile], {
    cwd: root,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(port), NODE_ENV: 'production', CONTACT_WEBHOOK_URL: webhook },
  });
  children.push(child);
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(base + '/api/health')).ok) return base; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server never answered on ${base}`);
}

const post = async (base, body) => {
  const res = await fetch(base + '/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let json = {};
  try { json = await res.json(); } catch { /* non-JSON is itself a failure below */ }
  return { status: res.status, json };
};

/* The stand-in for the clinic's email service. */
const received = [];
let replyWith = 200;
const recvPort = await freePort();
const receiver = http
  .createServer((req, res) => {
    let body = '';
    req.on('data', (d) => (body += d));
    req.on('end', () => {
      try { received.push(JSON.parse(body)); } catch { received.push(null); }
      res.writeHead(replyWith).end();
    });
  })
  .listen(recvPort);

const PATIENT = {
  name: 'Jane Patient',
  email: 'jane@example.com',
  phone: '07700 900123',
  subject: 'Booking',
  message: 'Lower back pain for three weeks, worse in the mornings.',
};

console.log('\nContact delivery — the built server against a stand-in email service\n');

try {
  /* Not configured: the form must fail honestly, never claim a send. */
  {
    const base = await startServer('');
    const r = await post(base, PATIENT);
    check('not configured -> refuses honestly', r.status === 503 && r.json.ok === false && r.json.error === 'not_configured',
      `${r.status} ${JSON.stringify(r.json)}`);
  }

  const base = await startServer(`http://localhost:${recvPort}/hook`);

  /* Bad input is turned away before anything is sent anywhere. */
  {
    const before = received.length;
    const a = await post(base, { name: 'A', email: 'a@b.co' });
    const b = await post(base, { name: 'A', email: 'not-an-email', message: 'x' });
    check('missing message -> 400', a.status === 400, String(a.status));
    check('malformed email -> 400', b.status === 400, String(b.status));
    check('bad input never reaches the email service', received.length === before);
  }

  /* Delivered: the patient's own words arrive, with how to reply to them. */
  {
    const before = received.length;
    const r = await post(base, PATIENT);
    const got = received[received.length - 1] || {};
    check('valid enquiry -> accepted', r.status === 200 && r.json.ok === true, `${r.status} ${JSON.stringify(r.json)}`);
    check('delivered exactly once', received.length === before + 1, `${received.length - before} deliveries`);
    check('carries the patient\'s words', got.message === PATIENT.message);
    check('carries name, email and phone to reply to',
      got.name === PATIENT.name && got.email === PATIENT.email && got.phone === PATIENT.phone);
    check('says where it came from', got.source === 'ct6-website-contact-form', String(got.source));
  }

  /* A very long message is capped rather than forwarded whole. */
  {
    await post(base, { ...PATIENT, message: 'x'.repeat(6000) });
    const got = received[received.length - 1] || {};
    check('an overlong message is capped at 5000 characters', (got.message || '').length === 5000,
      `${(got.message || '').length} characters forwarded`);
  }

  /* Refused: the email service is up but says no. */
  {
    replyWith = 500;
    const r = await post(base, PATIENT);
    check('refused delivery -> honest failure', r.status === 502 && r.json.ok === false, `${r.status} ${JSON.stringify(r.json)}`);
    replyWith = 200;
  }

  /* Unreachable: the email service is down entirely. */
  {
    await new Promise((r) => receiver.close(r));
    const r = await post(base, PATIENT);
    check('unreachable service -> honest failure', r.status === 502 && r.json.ok === false, `${r.status} ${JSON.stringify(r.json)}`);
  }
} catch (e) {
  check('audit ran to completion', false, String(e.message || e));
} finally {
  for (const c of children) c.kill();
  receiver.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${'='.repeat(64)}`);
console.log(`CONTACT: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
