import express from "express";
import fs from "fs";
import path from "path";
// NOTE: vite is deliberately NOT imported here. See the development branch at
// the foot of this file.
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * The clinic's previous website's addresses, and where each now lives.
 *
 * Its sitemap listed these, so they are what Google shows and what patients
 * have bookmarked; without this map every one of them landed on "Page not
 * found" on launch day. public/.htaccess carries the same map for when the
 * site is served as plain files. Express ignores a trailing slash here, so
 * "/services/osteopathy/" matches too. The old policy pages have no new page
 * yet (see the README).
 */
const OLD_SITE_REDIRECTS: Record<string, string> = {
  "/services": "/treatments",
  "/services/osteopathy": "/treatments/osteopathy",
  "/services/acupuncture": "/treatments/acupuncture",
  "/services/sports-massage": "/treatments/sports-massage",
  "/services/swedish-massage": "/treatments/swedish-massage",
  "/services/footcare": "/treatments/footcare",
  "/services/hypnothereapy": "/treatments/hypnotherapy",
  "/services/alternative-massage-therapies": "/treatments",
  "/services/physiotherapy": "/treatments",
  "/practitioners/alexandra-gibson-2": "/practitioners/alexandra-gibson",
  "/meet-our-experienced-practitioners-at-herne-bay-osteopathy-wellbeing-clinic": "/practitioners",
  "/herne-bay-osteopathy-wellbeing-clinic-holistic-care-for-optimal-health": "/",
  "/contact-us": "/contact",
  "/book-a-treatment-online": "/contact",
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  for (const [from, to] of Object.entries(OLD_SITE_REDIRECTS)) {
    app.get(from, (_req, res) => res.redirect(301, to));
  }

  app.use(express.json());

  /*
   * Health check. contactReady answers one question the Dashboard and
   * Settings > Diagnostics ask: is there somewhere for the contact form to
   * deliver to? It is only whether CONTACT_WEBHOOK_URL is set - never the
   * address itself, which stays on the server - and it does not promise the
   * service at that address is up (a refused delivery still returns 502).
   */
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      nodeEnv: process.env.NODE_ENV,
      contactReady: Boolean(process.env.CONTACT_WEBHOOK_URL),
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Patient enquiries.
   *
   * The contact form forwards the enquiry to whatever CONTACT_WEBHOOK_URL points
   * at - a Zapier, Make or Formspree hook, a mailer, an inbox integration. If
   * nothing is configured it says so plainly and refuses, so the interface can
   * tell the truth instead of inventing a confirmation.
   */
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, subject, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    const webhook = process.env.CONTACT_WEBHOOK_URL;
    if (!webhook) {
      console.warn("Contact form submitted but CONTACT_WEBHOOK_URL is not set — nowhere to deliver it.");
      return res.status(503).json({ ok: false, error: "not_configured" });
    }

    try {
      const delivery = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(name).slice(0, 200),
          email: String(email).slice(0, 200),
          phone: String(phone ?? "").slice(0, 60),
          subject: String(subject ?? "General Enquiry").slice(0, 120),
          message: String(message).slice(0, 5000),
          receivedAt: new Date().toISOString(),
          source: "ct6-website-contact-form",
        }),
      });

      if (!delivery.ok) {
        console.error(`Contact webhook rejected the enquiry: ${delivery.status}`);
        return res.status(502).json({ ok: false, error: "delivery_failed" });
      }

      return res.json({ ok: true });
    } catch (error: any) {
      console.error("Contact webhook unreachable:", error?.message);
      return res.status(502).json({ ok: false, error: "delivery_failed" });
    }
  });

  // All AI/voice endpoints (system-audit, generate-soap, prescribe-exercises, chat) have been removed.
  // They required GEMINI_API_KEY and were not essential for a customer-facing website.

  // Vite middleware for development.
  // Make vite available only when running the dev server (not in production mode).
  if (process.env.NODE_ENV !== "production") {
    const vite = await import("vite");
    const app_vite = await vite.createServer({});
    app.use(app_vite.middlewares);
  }

  // Serve the built client files
  const buildPath = path.resolve(process.cwd(), "dist");
  if (fs.existsSync(buildPath)) {
    /*
     * The server's own code is not a page. The build writes it into dist/
     * beside the site, with a source map that holds the whole of this file,
     * so express.static would hand both to anyone who asked.
     *
     * Judged on the file express.static would actually open, not on the
     * address as typed. A plain route for "/server.cjs" was tried first and
     * leaked: express.static decodes "%2E" to "." and resolves "/x/../", so
     * "/server%2Ecjs" and "/%73erver.cjs" still returned the code and its
     * map. Lower-cased and matched on the start of the name, because a
     * Windows disk also opens "SERVER.CJS" and "server.cjs.".
     */
    app.use((req, res, next) => {
      let asked: string;
      try {
        asked = decodeURIComponent(req.path);
      } catch {
        return next(); // a broken escape: express.static refuses it with a 400
      }
      const opened = path.relative(buildPath, path.normalize(path.join(buildPath, asked)));
      if (opened.toLowerCase().startsWith("server.cjs")) return res.status(404).end();
      next();
    });

    /*
     * CACHE BY WHAT A FILE IS, NOT ONE RULE FOR ALL.
     *
     * This used maxAge "1y" for everything, which included index.html. That
     * page names the current version of every other file, so a returning
     * patient's browser would keep the home page from their first visit for a
     * year, pinned to an old build that cannot repair itself - the same
     * stale-build crash the service-worker fix removed. Now:
     *   /assets/*  - names change with contents, so a year and "immutable";
     *   pages, the service worker and the manifest - checked every time;
     *   anything else (pictures, films, fonts) - a day.
     */
    app.use(
      express.static(buildPath, {
        etag: true,
        redirect: false, // never bounce /images to /images/ - see the slash rule below
        setHeaders: (res, filePath) => {
          const name = path.basename(filePath);
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (/\.(html|webmanifest)$/.test(name) || name === "sw.js" || name === "registerSW.js") {
            res.setHeader("Cache-Control", "no-cache");
          } else {
            res.setHeader("Cache-Control", "public, max-age=86400");
          }
        },
      })
    );

    /*
     * A missing FILE is a 404, never the app page. A tab left open across a
     * deploy asks for page code that no longer exists; answered with HTML, the
     * browser cannot run it and the site crashed. An unknown /api address
     * must fail plainly too, not return a page the form would try to read as
     * JSON. public/.htaccess does the same for a static host.
     */
    app.use(["/api", "/assets"], (_req, res) => {
      res.status(404).end();
    });
    app.use((req, res, next) => {
      if (/\.[A-Za-z0-9]{2,5}$/.test(req.path)) return res.status(404).end();
      next();
    });

    /*
     * One address per page: the old site ended every address with a slash.
     * Leading slashes and backslashes are collapsed to one, because a
     * browser reads "//somewhere.com" (or "/\somewhere.com") in a redirect as
     * ANOTHER WEBSITE - left alone, this rule would send visitors off-site.
     */
    app.use((req, res, next) => {
      if ((req.method === "GET" || req.method === "HEAD") && req.path.length > 1 && req.path.endsWith("/")) {
        const q = req.originalUrl.indexOf("?");
        const query = q === -1 ? "" : req.originalUrl.slice(q);
        const target = "/" + req.path.replace(/^[/\\]+/, "").replace(/\/+$/, "");
        return res.redirect(301, target + query);
      }
      next();
    });

    // SPA fallback: serve index.html for any unmatched routes
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
  process.exit(1);
});
