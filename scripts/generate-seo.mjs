/**
 * Writes robots.txt and sitemap.xml into dist/ after the client build.
 *
 * The site is a single-page app, so search engines have no directory of pages
 * to discover. Without a sitemap they see whatever they happen to follow.
 *
 * The address is read from SITE_URL so it moves with the domain:
 *   SITE_URL=https://www.yourdomain.co.uk npm run build
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const SITE_URL = (process.env.SITE_URL || 'https://salmon-gnat-721528.hostingersite.com')
  .replace(/\/+$/, '');

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

console.log(
  `SEO: sitemap.xml (${urls.length} urls: ${staticRoutes.length} pages, ` +
  `${treatments.length} treatments, ${practitioners.length} practitioners) + robots.txt -> ${SITE_URL}`
);
