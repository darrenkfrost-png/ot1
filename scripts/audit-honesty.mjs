/**
 * HONESTY AUDIT — greps the source for the specific untruths and dead patterns
 * this project has already had to remove once, so none of them can come back.
 *
 *   node scripts/audit-honesty.mjs        (exits 1 if anything is found)
 *
 * WHY A GREP AND NOT A JUDGEMENT CALL
 *
 * Every rule below is a REGRESSION TEST for a real defect that shipped on this
 * site. A fabricated patient was removed three times before he was actually
 * gone; a colour class that does not exist made a heading invisible; an
 * interpolated class name worked by coincidence for one colour and silently
 * produced nothing for the others. Those are all greppable, and a person
 * checking by eye will miss them again.
 *
 * This does NOT replace judgement — it catches the known-bad. New fabrications
 * still need a reader.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');

/* Each rule: what to find, why it is banned, and where it is allowed to appear.
   `allow` exists because the honest fix often has to NAME the thing it removed —
   a comment explaining "this used to claim X" must not itself trip the rule. */
const RULES = [
  {
    id: 'invented-people',
    why: 'A fabricated patient or clinician presented as real. Each of these shipped.',
    re: /\b(Richard Kent|Sarah Jenkins|Tom Barnes|Robert Davidson)\b/g,
  },
  {
    id: 'dead-colour-step',
    why: 'Not a real Tailwind step — the class generates nothing and the text inherits, invisibly.',
    re: /\b(?:text|bg|border|ring|from|to|via)-(?:slate|gray|zinc|teal|blue|indigo|emerald|red|amber|rose|violet)-(?:150|250|350|450|550|650|750|850)\b/g,
  },
  {
    id: 'interpolated-class',
    why: 'Tailwind cannot see a class built by interpolation; it exists only by coincidence.',
    re: /(?:className|class)=\{?[`"'][^`"']*\$\{[^}]*\}-(?:\d{2,3})/g,
  },
  {
    id: 'named-insurers',
    why: 'Naming insurers claims a relationship the clinic has not confirmed.',
    re: /\b(AXA|Bupa|Vitality|Aviva|WPA)\b/g,
  },
  {
    id: 'fake-infrastructure',
    why: 'Describes systems that do not exist (no LLM core, no server-agent node, no encryption).',
    re: /\b(Gemini 3\.5|server-agent node|LLM core|end-to-end encrypted|military-grade)\b/gi,
  },
  {
    id: 'fake-portal',
    why: 'Claims a secure messaging portal the site does not have.',
    re: /secure (?:message|messaging) portal/gi,
  },
  {
    id: 'impossible-guarantee',
    why: 'No clinician can promise a permanent cure; this is a regulatory risk, not just a lie.',
    re: /\b(never returns?|permanent results?|guaranteed (?:cure|recovery|results?)|100% success)\b/gi,
  },
  {
    id: 'unbacked-offer',
    why: 'Commits the clinic to something nobody agreed to provide.',
    re: /free (?:15|fifteen)[- ]minute consultation/gi,
  },
  {
    id: 'staging-domain',
    why: 'The temporary host must never be a canonical/OG target — it would compete with the real site.',
    re: /salmon-gnat-721528\.hostingersite\.com/g,
    files: /\.(tsx?|html)$/,
    allowFile: /index\.html$/, // index.html is checked separately for its robots guard
  },
];

/* Structural rules: not lies, but defects with the same "nobody notices until a
   patient hits it" character. Checked over the whole element, since JSX splits
   an anchor's attributes across lines. */
const STRUCTURAL = [
  {
    id: 'blank-without-noopener',
    why: 'target="_blank" without rel="noopener" hands the new tab a handle on this one.',
    // an opening <a ...> element containing target="_blank" but no rel=...noopener
    re: /<a\b(?:[^>]|\n)*?target=["']_blank["'](?:[^>]|\n)*?>/g,
    reject: (m) => !/rel=["'][^"']*noopener/.test(m),
  },
];

/* Contact details belong to ONE file. Anywhere else they are a copy that will
   drift the day the clinic changes them. */
const DRIFT = [
  { id: 'hardcoded-phone', re: /\b01227[\s-]?366473\b/g, home: 'src/data/clinic.ts' },
  { id: 'hardcoded-postcode', re: /\bCT6\s?5AJ\b/g, home: 'src/data/clinic.ts' },
];

const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|html|css)$/.test(name)) out.push(p);
  }
  return out;
};

/* A hit inside a comment is usually the fix explaining itself. Those lines are
   reported separately rather than failing the run — removing the explanation
   would lose the reason the code is shaped the way it is. */
const isComment = (line) => /^\s*(\{\s*\/\*|\/\/|\/\*|\*|<!--)/.test(line);

const files = [...walk(SRC), join(ROOT, 'index.html')];
let hard = 0, soft = 0;

for (const rule of RULES) {
  const hits = [];
  for (const f of files) {
    if (rule.files && !rule.files.test(f)) continue;
    if (rule.allowFile && rule.allowFile.test(f)) continue;
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      rule.re.lastIndex = 0;
      if (rule.re.test(line)) hits.push({ f: relative(ROOT, f), n: i + 1, line: line.trim().slice(0, 96), c: isComment(line) });
    });
  }
  const real = hits.filter((h) => !h.c);
  const inComments = hits.filter((h) => h.c);
  hard += real.length;
  soft += inComments.length;
  if (real.length) {
    console.log(`\n✗ ${rule.id} — ${real.length} occurrence(s)`);
    console.log(`  ${rule.why}`);
    for (const h of real.slice(0, 8)) console.log(`    ${h.f}:${h.n}  ${h.line}`);
  }
  if (inComments.length) soft += 0; // counted above; listed only in the summary
}

for (const rule of STRUCTURAL) {
  const hits = [];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    rule.re.lastIndex = 0;
    for (const m of src.matchAll(rule.re)) {
      if (!rule.reject(m[0])) continue;
      hits.push({ f: relative(ROOT, f), n: src.slice(0, m.index).split('\n').length });
    }
  }
  if (hits.length) {
    hard += hits.length;
    console.log(`\n✗ ${rule.id} — ${hits.length} occurrence(s)`);
    console.log(`  ${rule.why}`);
    for (const h of hits.slice(0, 8)) console.log(`    ${h.f}:${h.n}`);
  }
}

/*
 * A SECRET MUST NEVER REACH THE BUNDLE.
 *
 * Vite's `define` is a literal text substitution into the CLIENT build, so a
 * key defined there is published to every visitor who loads the page. This
 * config carried exactly such a line for a Gemini key, harmless only because
 * no .env existed to fill it in — and .env.example invites someone to make
 * one. The config is checked here, and the built assets are checked for a
 * key-shaped string, because the config is the intent and the bundle is the
 * fact.
 */
{
  const cfg = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
  for (const line of cfg.split(/\r?\n/)) {
    if (isComment(line)) continue;
    const m = line.match(/['"]?([A-Za-z0-9_.]*(?:API_KEY|SECRET|TOKEN|PASSWORD)[A-Za-z0-9_.]*)['"]?\s*:/i);
    if (!m) continue;
    hard++;
    console.log(`\n✗ secret-in-bundle — vite.config.ts defines "${m[1]}" into the client build`);
    console.log('  define() substitutes literally into the browser bundle. Route it through the server.');
  }

  /* And the fact: an API-key-shaped literal sitting in a built asset. */
  const distDir = join(ROOT, 'dist', 'assets');
  if (existsSync(distDir)) {
    for (const f of readdirSync(distDir).filter((n) => n.endsWith('.js'))) {
      const hit = readFileSync(join(distDir, f), 'utf8').match(/AIza[A-Za-z0-9_-]{30,}|sk-[A-Za-z0-9]{32,}/);
      if (hit) {
        hard++;
        console.log(`\n✗ key-in-built-asset — dist/assets/${f} contains a key-shaped literal`);
      }
    }
  }
}

/*
 * THE SITEMAP MUST NAME THE SAME SITE AS THE PAGE HEADERS.
 *
 * index.html's canonical was moved to the clinic's own domain while the
 * sitemap and robots.txt still advertised the temporary host — two answers to
 * "where does this site live", which is precisely the question a search
 * engine is asking. Checked against the built output, because the generator
 * is the intent and dist/ is what gets served.
 */
{
  /* Read locally: this block runs before the shared `html` const below. */
  const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const canonical = (indexHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1];
  const host = canonical && new URL(canonical).host;
  for (const name of ['sitemap.xml', 'robots.txt']) {
    const p = join(ROOT, 'dist', name);
    if (!host || !existsSync(p)) continue;
    const body = readFileSync(p, 'utf8');
    /* Only the URLs that ADDRESS the site: <loc> entries and the Sitemap:
       line. The xmlns is a schema identifier that must stay sitemaps.org —
       the first version of this rule flagged it and was wrong. */
    const addresses = [
      ...[...body.matchAll(/<loc>\s*([^<\s]+)/g)].map((m) => m[1]),
      ...[...body.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]),
    ];
    const others = addresses
      .map((u) => { try { return new URL(u).host; } catch { return null; } })
      .filter((h) => h && h !== host);
    if (others.length) {
      hard++;
      console.log(`\n✗ sitemap-host-drift — dist/${name} names ${[...new Set(others)].join(", ")}, but the canonical says ${host}`);
      console.log('  A search engine reading both is told the site lives in two places.');
    }
  }
}

/*
 * index.html is the one honest exception to the single-source rule: search
 * engines and social cards read the STATIC html, which cannot import a
 * TypeScript constant, so the address and phone must appear there as literals.
 * Banning them would be wrong and ignoring them would let the copy drift, so
 * instead the literals are checked for AGREEMENT with clinic.ts — the actual
 * risk, caught directly.
 */
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const clinicSrc = readFileSync(join(SRC, 'data', 'clinic.ts'), 'utf8');
const fieldOf = (name) => (clinicSrc.match(new RegExp(`${name}:\\s*'([^']+)'`)) || [])[1];
const MUST_AGREE = [
  ['line1', fieldOf('line1')],
  ['postcode', fieldOf('postcode')],
  ['telephone', fieldOf('telephone')],
];
for (const [name, value] of MUST_AGREE) {
  if (!value) continue;
  if (!html.includes(value)) {
    hard++;
    console.log(`\n✗ meta-drift — index.html does not carry the current ${name} ("${value}")`);
    console.log('  Static meta and structured data are read by search engines; if they disagree');
    console.log('  with src/data/clinic.ts, one of the two is telling patients the wrong thing.');
  }
}

for (const d of DRIFT) {
  const hits = [];
  for (const f of files) {
    if (relative(ROOT, f).replace(/\\/g, '/') === d.home) continue;
    if (/index\.html$/.test(f)) continue; // checked for agreement just above
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      d.re.lastIndex = 0;
      if (d.re.test(line) && !isComment(line)) hits.push({ f: relative(ROOT, f), n: i + 1 });
    });
  }
  if (hits.length) {
    hard += hits.length;
    console.log(`\n✗ ${d.id} — ${hits.length} copy/copies outside ${d.home}`);
    console.log('  Contact details live in one file; a copy is a lie waiting for the day it changes.');
    for (const h of hits.slice(0, 8)) console.log(`    ${h.f}:${h.n}`);
  }
}

/* The staging guard: while the site is on a temporary host it must not be
   indexed, or it competes with the clinic's real domain in search. */
const onStaging = /hostingersite\.com/.test(html);
const noindexed = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
if (onStaging && !noindexed) {
  hard++;
  console.log('\n✗ staging-indexable — index.html names the temporary host but has no robots noindex');
  console.log('  An indexed staging copy competes with the clinic\'s real site in search results.');
}

console.log(`\n${'='.repeat(64)}`);
if (!hard) {
  console.log(`HONESTY: clean — ${files.length} files checked, ${RULES.length + DRIFT.length + 1} rules, 0 violations`);
  if (soft) console.log(`(${soft} mention(s) inside comments, which is where a removed claim is allowed to be explained)`);
} else {
  console.log(`HONESTY: ${hard} violation(s) across ${files.length} files`);
}
process.exit(hard > 0 ? 1 : 0);
