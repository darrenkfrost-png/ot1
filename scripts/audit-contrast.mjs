/**
 * CONTRAST AUDIT — measures the text on every page against the colour that is
 * actually behind it, and reports what falls below the readable minimum.
 *
 *   node scripts/audit-contrast.mjs [baseUrl]      (default http://localhost:4601)
 *
 * WHY THIS EXISTS RATHER THAN A BROWSER-CONSOLE SNIPPET
 *
 * Three things make this measurement easy to get wrong, and each of them
 * produced a confident, wrong answer before this script existed:
 *
 *  1. SCROLL-REVEAL ANIMATIONS. Most sections start at opacity 0 and fade in
 *     when scrolled to. In a hidden or background tab the animation frame
 *     callback is starved, so they never reveal - 118 of 137 text elements on
 *     the practitioners page were still invisible, and measuring them produced
 *     47 "failures" that did not exist. This script drives a real browser and
 *     scrolls the whole page first.
 *
 *  2. TRANSLUCENT PANELS. A card on `bg-white/60` over a dark page is neither
 *     white nor dark - it composites to a mid grey. Treating the panel as
 *     invisible and reading the page behind it reported 3.75:1 where the truth
 *     was 1.86:1. Every translucent layer is collected and composited here.
 *
 *  3. oklch COLOURS. Tailwind v4 emits `oklch(...)`, and pulling the numbers
 *     out of that string as if they were RGB reports light-on-dark text as
 *     failing. Colours are converted by painting them to a canvas and reading
 *     the pixel back, which makes the browser do the conversion.
 *
 * Text sitting on a photograph is reported separately and NOT counted as
 * failing: there is no single backdrop colour to measure, so those need a
 * person to look at them.
 */

import { createRequire } from 'node:module';

const BASE = process.argv[2] || 'http://localhost:4601';

const PAGES = [
  '/', '/treatments', '/practitioners', '/gallery',
  '/resources', '/locations', '/faq', '/contact', '/dashboard',
];

/* playwright-core is not a dependency of this project. Use it if it is
   installed; otherwise fall back to the copy in the sibling estate project so
   the audit can be run without adding a package. */
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
    } catch { /* try the next one */ }
  }
  throw new Error('playwright-core not found. Run: npm i -D playwright-core');
}

/** Runs inside the page. Returns the failing text elements, grouped. */
const AUDIT = () => {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const toRGBA = (c) => {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#ff00ff'; ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  // Every translucent layer, composited over white.
  const trueBg = (el) => {
    const stack = []; let n = el;
    while (n && n !== document.documentElement) {
      const c = toRGBA(getComputedStyle(n).backgroundColor);
      if (c[3] > 0.001) { stack.push(c); if (c[3] >= 0.999) break; }
      n = n.parentElement;
    }
    let base = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) {
      const c = stack[i];
      base = [0, 1, 2].map((k) => c[k] * c[3] + base[k] * (1 - c[3]));
    }
    return base.map(Math.round);
  };
  const hiddenByAncestor = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.15) return true;
      n = n.parentElement;
    }
    return false;
  };
  const onMedia = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if ((cs.webkitBackgroundClip || cs.backgroundClip) === 'text') return true; // gradient lettering
      // A sibling <img>/<video> painted under the text inside the same
      // positioned box is a photo backdrop, even though no CSS background is
      // set - the locations tags sit on exactly this and were being judged
      // against white that is never visible.
      if (n !== el && n.querySelector(':scope > img, :scope > video')) return true;
      n = n.parentElement;
    }
    return false;
  };

  const groups = {}; let onMediaCount = 0, checked = 0;
  const SEL = 'p,span,li,h1,h2,h3,h4,h5,h6,a,div,td,th,label,button,strong,em,dd,dt';
  for (const el of document.querySelectorAll(SEL)) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!own.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (hiddenByAncestor(el)) continue;
    if (onMedia(el)) { onMediaCount++; continue; }

    const cs = getComputedStyle(el);
    const fgR = toRGBA(cs.color);
    if (fgR[3] < 0.2) continue;
    const bg = trueBg(el);
    const fg = fgR[3] >= 0.999 ? fgR.slice(0, 3) : [0, 1, 2].map((k) => fgR[k] * fgR[3] + bg[k] * (1 - fgR[3]));
    const cr = ratio(fg, bg);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;  // WCAG AA
    checked++;
    if (cr < need - 0.01) {
      const cls = (typeof el.className === 'string' ? el.className : '');
      const colour = (cls.match(/text-(slate|teal|white|emerald|stone|red|amber)-\d+|text-white\/\d+/g) || []).join(' ') || '(inherited)';
      const key = `${colour} on rgb(${bg.join(',')})`;
      groups[key] = groups[key] || { n: 0, cr: +cr.toFixed(2), need, sample: '' };
      groups[key].n++;
      if (!groups[key].sample) groups[key].sample = (el.innerText || '').trim().slice(0, 44).replace(/\s+/g, ' ');
    }
  }
  return { checked, onMediaCount, groups };
};

const chromium = await loadChromium();
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

let totalFail = 0, totalChecked = 0;
/*
 * The opening film covers the whole viewport for several seconds. Measuring
 * through it reports the film's colours as if they were the page's - the first
 * run of this audit produced 285 "failures" that were really the intro. Skip it
 * and wait for it to actually leave before measuring anything.
 */
async function dismissIntro() {
  // TWO gates, not one: the film, and then a welcome screen behind it. Missing
  // the second one is just as bad as missing the first - the audit measures the
  // welcome screen's colours and reports them as the page's.
  const GATES = ['SKIP INTRO', 'ENTER TO BEGIN', 'EXPLORE AS GUEST', 'CONTINUE'];
  for (let round = 0; round < 6; round++) {
    let clicked = false;
    for (const label of GATES) {
      const b = page.locator(`button:has-text("${label}"), a:has-text("${label}")`).first();
      if (await b.count().catch(() => 0)) {
        await b.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1100);
        clicked = true;
      }
    }
    if (!clicked) break;
  }
  // Confirm nothing is left covering the page.
  for (const label of GATES) {
    if (await page.locator(`button:has-text("${label}")`).count().catch(() => 0)) return false;
  }
  return true;
}

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const gone = await dismissIntro();
  if (!gone) console.log(`   (warning: the intro overlay would not dismiss on ${path} - numbers below are unreliable)`);
  await page.waitForTimeout(1500);
  // Scroll the whole page so the reveal animations actually fire.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  await page.waitForTimeout(800);

  const { checked, onMediaCount, groups } = await page.evaluate(AUDIT);
  const rows = Object.entries(groups).sort((a, b) => b[1].n - a[1].n);
  const failing = rows.reduce((s, [, v]) => s + v.n, 0);
  totalFail += failing; totalChecked += checked;

  console.log(`\n${path}  —  ${checked} measured, ${failing} failing, ${onMediaCount} over photos (not judged)`);
  for (const [k, v] of rows.slice(0, 8)) {
    console.log(`   ${String(v.n).padStart(3)}x  ${String(v.cr).padStart(5)}:1 (need ${v.need})  ${k}`);
    console.log(`         "${v.sample}"`);
  }
  if (!rows.length) console.log('   all pass');
}

console.log(`\n${'='.repeat(64)}`);
console.log(`TOTAL: ${totalFail} failing of ${totalChecked} measured across ${PAGES.length} pages`);
await browser.close();
process.exit(totalFail > 0 ? 1 : 0);
