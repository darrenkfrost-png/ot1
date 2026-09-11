/**
 * FOCUS AUDIT — can a keyboard user see where they are? Judged by the pixels
 * actually on screen, at every focus stop on every page.
 *
 *   node scripts/audit-focus.mjs          (after npm run build; takes a few minutes)
 *
 * WHY PIXELS AND NOT STYLES. Two earlier ways of measuring this both lied:
 *   - "did any style change on focus?" passed a ring that was teal at 50%
 *     opacity — 444 of 444 rings were under 3:1, median 1.32:1;
 *   - computed colours composited over the page background reported a median
 *     of 3.41:1, because they cannot see the wallpaper film behind the glass.
 *     The real pixels behind most controls are mid-to-dark greys.
 * So each stop is photographed and its bands are read from the image.
 *
 * WHAT A PASS MEANS. The indicator (index.css, FOCUS INDICATOR) is WCAG
 * technique C40: a dark outline with a white halo either side, 14:1 apart, so
 * one of them always stands clear of whatever is behind it. A stop passes when
 * both bands are really drawn (3:1 apart as rendered) AND at least one is 3:1
 * clear of the real backdrop. Controls marked .focus-inset draw the same bands
 * inside their edge and are read from the inside.
 *
 * WHAT IT CATCHES. Any container that hides overflow tight around a control
 * clips the indicator away. That was the whole residue last time: accordion
 * questions in rounded cards, buttons hard against a card edge, and the
 * breadcrumb list, which scrolls sideways and so clips its first link.
 *
 * Traps already paid for: the entrance gates are dismissed first; the mouse is
 * parked in a corner so hover cannot pose as focus; each stop waits 850ms,
 * because cards transition every property over up to 700ms and an early
 * screenshot shows the START of the change; and there are TWO "Home" links on
 * inner pages (sidebar "HOME", breadcrumb "Home") — the report prints each
 * stop's position so the two cannot be confused again.
 */
import { createRequire } from 'node:module';
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

const GROUPS = [
  ['/', '/treatments', '/practitioners'],
  ['/gallery', '/resources', '/locations'],
  ['/faq', '/contact', '/dashboard'],
];
const TABS = 150;
const SETTLE = 850;
const GATES = ['SKIP INTRO', 'ENTER TO BEGIN', 'EXPLORE AS GUEST', 'CONTINUE'];

async function loadChromium() {
  const require = createRequire(import.meta.url);
  for (const c of ['playwright-core', 'C:/Users/darre/OneDrive/Desktop/DEFROST-WORLD/node_modules/playwright-core/index.mjs']) {
    try {
      const mod = c.startsWith('C:') ? await import('file:///' + c) : require(c);
      if (mod.chromium) return mod.chromium;
    } catch { /* try the next */ }
  }
  throw new Error('playwright-core not found. Run: npm i -D playwright-core');
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });

const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const chromium = await loadChromium();
const port = await freePort();
const base = `http://localhost:${port}`;
const server = spawn(process.execPath, [serverFile], {
  cwd: root,
  stdio: 'ignore',
  env: { ...process.env, PORT: String(port), NODE_ENV: 'production', CONTACT_WEBHOOK_URL: '' },
});

/* The screenshots are decoded by a browser too — a separate one, so nothing it
   does can touch the page being measured. A fresh canvas per call keeps the
   three workers from drawing over each other. */
const decoderBrowser = await chromium.launch({ channel: 'msedge' });
const decoder = await decoderBrowser.newPage();
const pixels = (png, pts) => decoder.evaluate(async ({ b64, pts }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  return pts.map(([px, py]) => Array.from(x.getImageData(
    Math.max(0, Math.min(img.width - 1, px)), Math.max(0, Math.min(img.height - 1, py)), 1, 1).data).slice(0, 3));
}, { b64: png.toString('base64'), pts });

async function audit(pages) {
  const browser = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const lines = [], failures = [];
  let pass = 0, fail = 0, skipped = 0;
  try {
    for (const path of pages) {
      await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2300);
      /* The door mounts only after the film's exit animation, so one empty
         round is not proof the entrance has gone. Under load, a run of this
         audit checked too early and measured 47 "focus stops" on the door
         itself. The entrance is gone only after two quiet rounds in a row. */
      for (let r = 0, quiet = 0; r < 12 && quiet < 2; r++) {
        let clicked = false;
        for (const g of GATES) {
          const b = page.locator(`button:has-text("${g}")`).first();
          if (await b.count().catch(() => 0)) { await b.click({ force: true }).catch(() => {}); await page.waitForTimeout(800); clicked = true; }
        }
        quiet = clicked ? 0 : quiet + 1;
        if (!clicked) await page.waitForTimeout(700);
      }
      await page.evaluate(async () => {
        const s = Math.round(innerHeight * 0.8);
        for (let y = 0; y < document.documentElement.scrollHeight; y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 140)); }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(600);
      await page.mouse.move(2, 2);
      await page.evaluate(() => document.activeElement?.blur?.());

      const seen = new Set();
      let pp = 0, pf = 0;
      for (let t = 0; t < TABS; t++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(SETTLE);
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          if (!el.dataset.fa) el.dataset.fa = String(Math.random()).slice(2);
          const r = el.getBoundingClientRect();
          return {
            id: el.dataset.fa,
            label: (el.getAttribute('aria-label') || el.innerText || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40),
            x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight,
            inset: parseFloat(getComputedStyle(el).outlineOffset) < 0,
          };
        });
        if (!info || seen.has(info.id)) break;
        seen.add(info.id);
        const cy = info.y + info.h / 2;
        if (cy < 4 || cy > info.vh - 4 || info.w < 2) { skipped++; continue; }
        const where = `@${Math.round(info.x)},${Math.round(info.y)}`;

        let ok, detail;
        if (info.inset) {
          // white 0..2px in, dark 2..5px, white 5..7px, then the control's surface
          const ex = Math.round(info.x);
          const clip = { x: Math.max(0, ex), y: Math.max(0, Math.round(cy) - 2), width: 24, height: 4 };
          const ly = Math.round(cy) - clip.y;
          const [edge, dark, inner, surface] = await pixels(await page.screenshot({ clip }), [[1, ly], [3, ly], [6, ly], [16, ly]]);
          ok = ratio(dark, inner) >= 3 && Math.max(ratio(dark, surface), ratio(inner, surface)) >= 3;
          detail = `inset: edge ${edge} | dark ${dark} | inner ${inner} | surface ${surface}`;
        } else {
          // white 0..2px out, dark 2..5px, white 5..7px, then the real backdrop
          const useLeft = info.x >= 14;
          const e = useLeft ? Math.round(info.x) : Math.round(info.x + info.w);
          if (!useLeft && e > info.vw - 14) { skipped++; continue; }
          const clip = { x: Math.max(0, e - 14), y: Math.max(0, Math.round(cy) - 2), width: 28, height: 4 };
          if (clip.x + clip.width > info.vw) clip.width = info.vw - clip.x;
          const lx = e - clip.x, ly = Math.round(cy) - clip.y, d = useLeft ? -1 : 1;
          const at = (k) => [lx + d * k - (useLeft ? 1 : 0), ly];
          const [inner, dark, outer, beyond] = await pixels(await page.screenshot({ clip }), [at(1), at(4), at(6), at(10)]);
          ok = ratio(dark, outer) >= 3 && Math.max(ratio(dark, beyond), ratio(outer, beyond)) >= 3;
          detail = `inner ${inner} | dark ${dark} | outer ${outer} | beyond ${beyond}`;
        }
        if (ok) { pass++; pp++; }
        else { fail++; pf++; failures.push(`${path} "${info.label}" ${where}  ${detail}`); }
      }
      lines.push(`  ${path.padEnd(16)} ${String(pp + pf).padStart(3)} stops   ${String(pf).padStart(3)} not visible`);
    }
  } finally {
    await browser.close();
  }
  return { lines, failures, pass, fail, skipped };
}

console.log('\nFocus visibility — every focus stop, judged by rendered pixels\n');
let exitCode = 1;
try {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(base + '/api/health')).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  const results = await Promise.all(GROUPS.map(audit));
  for (const r of results) for (const l of r.lines) console.log(l);
  const pass = results.reduce((s, r) => s + r.pass, 0);
  const fail = results.reduce((s, r) => s + r.fail, 0);
  const skipped = results.reduce((s, r) => s + r.skipped, 0);
  console.log(`\n${'='.repeat(64)}`);
  console.log(`FOCUS: ${fail} of ${pass + fail} focus stops show no visible indicator  (${skipped} off-screen, not judged)`);
  for (const f of results.flatMap((r) => r.failures).slice(0, 25)) console.log('   ' + f);
  exitCode = fail ? 1 : 0;
} finally {
  await decoderBrowser.close();
  server.kill();
}
process.exit(exitCode);
