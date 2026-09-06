/**
 * Writes robots.txt and sitemap.xml into dist/ after the client build.
 *
 * The site is a single-page app, so search engines have no directory of pages
 * to discover. Without a sitemap they see whatever they happen to follow.
 *
 * The address is read from SITE_URL so it moves with the domain:
 *   SITE_URL=https://www.yourdomain.co.uk npm run build
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

/*
 * THE ADDRESS COMES FROM ONE PLACE.
 *
 * This defaulted to the temporary Hostinger host while index.html's canonical
 * and og:url had already been moved to the clinic's own domain — so the
 * sitemap and robots.txt were advertising one site and the page headers
 * another. Both now read CLINIC.website, and SITE_URL still overrides for a
 * one-off build:
 *   SITE_URL=https://staging.example.com npm run build
 */
const clinicSrc = readFileSync(join(root, 'src', 'data', 'clinic.ts'), 'utf8');
const websiteMatch = clinicSrc.match(/website:\s*'([^']+)'/);
if (!websiteMatch) {
  console.error('generate-seo: CLINIC.website not found in src/data/clinic.ts');
  process.exit(1);
}
const SITE_URL = (process.env.SITE_URL || websiteMatch[1]).replace(/\/+$/, '');

/** Pull the ids out of one exported array in the data file. */
function idsBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) return [];
  const end = endMarker ? source.indexOf(endMarker, start) : source.length;
  const block = source.slice(start, end === -1 ? source.length : end);
  return [...block.matchAll(/^\s{4}id:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
}

const data = readFileSync(join(root, 'src/data/index.ts'), 'utf8');
const treatments = idsBetween(data, 'export const TREATMENTS', 'export const PRACTITIONERS');
const practitioners = idsBetween(data, 'export const PRACTITIONERS', null);

// priority and change frequency reflect how central each page is, not wishes
const staticRoutes = [
  ['/', '1.0', 'weekly'],
  ['/treatments', '0.9', 'monthly'],
  ['/practitioners', '0.8', 'monthly'],
  ['/faq', '0.8', 'monthly'],
  ['/contact', '0.8', 'yearly'],
  ['/locations', '0.7', 'yearly'],
  ['/resources', '0.6', 'monthly'],
  ['/gallery', '0.5', 'monthly'],
];

const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...staticRoutes.map(([path, priority, freq]) => ({ path, priority, freq })),
  ...treatments.map((id) => ({ path: `/treatments/${id}`, priority: '0.7', freq: 'monthly' })),
  ...practitioners.map((id) => ({ path: `/practitioners/${id}`, priority: '0.6', freq: 'monthly' })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, priority, freq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `# Osteopathy & Wellbeing @CT6
User-agent: *
Allow: /

# The patient dashboard is a personal view, not a page worth indexing.
Disallow: /dashboard

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(dist, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(join(dist, 'robots.txt'), robots, 'utf8');

/*
 * GOING LIVE IS A COMMAND, NOT A THING TO REMEMBER.
 *
 * index.html carries <meta name="robots" content="noindex"> so that the
 * temporary host can never be indexed and compete with the clinic in search.
 * That guard used to be a line someone had to remember to delete on the day
 * the real domain went live — and forgetting it means the new site is never
 * found at all, silently, with nothing on the page to show for it.
 *
 * So the build owns the decision instead:
 *   npm run build        — not indexable (safe, the default)
 *   npm run build:live   — indexable, for the real domain
 *
 * The source file always keeps the guard; only the BUILT copy has it
 * removed, so nobody can leave the repository in an unsafe state.
 */
const LIVE = process.env.LIVE === '1';
const indexPath = join(dist, 'index.html');
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, 'utf8');
  const guard = /\s*<meta[^>]+data-staging-guard[^>]*>/i;
  const hasGuard = guard.test(html);
  if (LIVE && hasGuard) {
    writeFileSync(indexPath, html.replace(guard, ''), 'utf8');
    console.log(`SEO: LIVE build — the noindex guard has been REMOVED. ${SITE_URL} is indexable.`);
  } else if (LIVE) {
    console.log(`SEO: LIVE build — no guard present. ${SITE_URL} is indexable.`);
  } else if (hasGuard) {
    console.log('SEO: not indexable (noindex guard in place). Use `npm run build:live` for the real domain.');
  } else {
    console.error('SEO: REFUSING — this is not a LIVE build, but index.html carries no noindex guard.');
    console.error('     Restore <meta name="robots" content="noindex" data-staging-guard /> or build with LIVE=1.');
    process.exit(1);
  }
}

console.log(
  `SEO: sitemap.xml (${urls.length} urls: ${staticRoutes.length} pages, ` +
  `${treatments.length} treatments, ${practitioners.length} practitioners) + robots.txt -> ${SITE_URL}`
);
