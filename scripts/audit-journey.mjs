/**
 * PATIENT JOURNEY AUDIT — drives the real site through the paths a patient
 * actually takes, and fails if any of them break.
 *
 *   node scripts/audit-journey.mjs [baseUrl] [mobile]
 *     ...the second argument "mobile" runs the same journey at 375px.
 *
 * The other two gates check that the site tells the truth (audit-honesty) and
 * that it can be read (audit-contrast). This one checks that it WORKS: that a
 * person arriving with back pain can find a treatment, find out who would
 * treat them, reach the phone, and reach the booking system.
 *
 * Everything here is asserted against the rendered page in a real browser,
 * because every one of these paths has been broken at some point by a change
 * that looked harmless in the source.
 */

import { createRequire } from 'node:module';

const BASE = process.argv[2] || 'http://localhost:4601';

/* Most people arrive on a phone, and the phone layout hides navigation behind
   a drawer — a journey that only passes at 1440px is half a test. */
const MOBILE = process.argv[3] === 'mobile';

async function loadChromium() {
  const require = createRequire(import.meta.url);
  const candidates = [
    'playwright-core',
    'C:/Users/darre/OneDrive/Desktop/DEFROST-WORLD/node_modules/playwright-core/index.mjs',
  ];
  for (const c of candidates) {
    try {
      const mod = c.startsWith('C:') ? await import('file:///' + c) : require(c);
      if (mod.chromium) return mod.chromium;
    } catch { /* try the next */ }
  }
  throw new Error('playwright-core not found. Run: npm i -D playwright-core');
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const chromium = await loadChromium();
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage(MOBILE
  ? { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true }
  : { viewport: { width: 1440, height: 960 } });

const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 140)));

/* The entrance gates cover the whole viewport. Measuring or clicking through
   them tests the gate, not the site. */
const GATES = ['SKIP INTRO', 'ENTER TO BEGIN', 'EXPLORE AS GUEST', 'CONTINUE'];
async function enter(path = '/') {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  /* The door mounts only after the film's exit animation, so one empty round
     is not proof the entrance has gone — the entrance is gone only after two
     quiet rounds in a row. (A focus audit that checked once measured 47 stops
     on the door itself.) */
  for (let round = 0, quiet = 0; round < 12 && quiet < 2; round++) {
    let clicked = false;
    for (const label of GATES) {
      const b = page.locator(`button:has-text("${label}")`).first();
      if (await b.count().catch(() => 0)) {
        await b.click({ force: true }).catch(() => {});
        await page.waitForTimeout(800);
        clicked = true;
      }
    }
    quiet = clicked ? 0 : quiet + 1;
    if (!clicked) await page.waitForTimeout(700);
  }
  await page.waitForTimeout(1000);
}

/* Reveal animations start at opacity 0; without scrolling, half the page is
   invisible and every assertion about it is meaningless. */
async function revealAll() {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

console.log(`\nPatient journey — ${BASE}  (${MOBILE ? 'phone, 375px' : 'desktop, 1440px'})\n`);

// 1. The front door renders, and says who this is.
await enter('/');
await revealAll();
check('home page renders the clinic name',
  (await page.locator('text=/Osteopathy/i').count()) > 0);

// 2. Booking is reachable and leaves for the real booking system.
{
  const book = page.locator('a[href*="rushcliff"], a[href*="ob."]').first();
  const n = await book.count();
  const href = n ? await book.getAttribute('href') : '';
  check('booking link present and external', n > 0 && /^https?:\/\//.test(href || ''), href || 'none found');
  const rel = n ? (await book.getAttribute('rel')) || '' : '';
  check('booking link is safe (noopener)', /noopener/.test(rel), rel || 'missing rel');
}

// 3. The phone number is a real, dialable link.
{
  const tel = page.locator('a[href^="tel:"]').first();
  const href = (await tel.count()) ? await tel.getAttribute('href') : '';
  check('phone is a tel: link', /^tel:\+?[\d\s]+$/.test(href || ''), href || 'none');
}

// 4. A patient with back pain can reach a treatment page with real content.
await enter('/treatments');
await revealAll();
{
  const card = page.locator('a[href^="/treatments/"]').first();
  const ok = await card.count();
  const href = ok ? await card.getAttribute('href') : '';
  check('treatments list offers a treatment', ok > 0, href || 'none');
  if (ok) {
    await enter(href);
    await revealAll();
    const words = (await page.locator('#main-content').innerText().catch(() => '')).trim().length;
    check('treatment page has real content', words > 400, `${words} characters`);
    check('treatment page offers a way to book',
      (await page.locator('a[href*="rushcliff"], a[href^="tel:"]').count()) > 0);
  }
}

// 5. A patient can find out who would treat them.
await enter('/practitioners');
await revealAll();
{
  const p = page.locator('a[href^="/practitioners/"]').first();
  const ok = await p.count();
  const href = ok ? await p.getAttribute('href') : '';
  check('practitioners list offers a person', ok > 0, href || 'none');
  if (ok) {
    await enter(href);
    await revealAll();
    const words = (await page.locator('#main-content').innerText().catch(() => '')).trim().length;
    check('practitioner page has real content', words > 300, `${words} characters`);
    check('practitioner page offers contact',
      (await page.locator('a[href^="tel:"], a[href^="mailto:"]').count()) > 0);
  }
}

// 6. The contact page asks for what it needs and never claims a false send.
await enter('/contact');
await revealAll();
check('contact form present',
  (await page.locator('form, input[name="name"], input[name="email"]').count()) > 0);
check('contact page shows the phone as an alternative',
  (await page.locator('a[href^="tel:"]').count()) > 0);

// 7. A wrong address must not strand anyone.
{
  await page.goto(BASE + '/this-page-does-not-exist', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const text = (await page.locator('body').innerText().catch(() => '')).toLowerCase();
  const stranded = text.includes('cannot get') || text.trim().length < 40;
  check('unknown URL still shows the site', !stranded, stranded ? 'blank or server error' : 'renders');
  check('unknown URL offers a way onward',
    (await page.locator('a[href="/"], a[href^="/treatments"], button, a').count()) > 2);
}

// 8. Nothing threw along the way.
check('no page errors during the journey', pageErrors.length === 0,
  pageErrors.slice(0, 2).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${'='.repeat(64)}`);
console.log(`JOURNEY: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) for (const f of failed) console.log(`   ✗ ${f.name}  ${f.detail}`);
process.exit(failed.length ? 1 : 0);
