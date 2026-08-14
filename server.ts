import express from "express";
import fs from "fs";
import path from "path";
// NOTE: vite is deliberately NOT imported here. See the development branch at
// the foot of this file.
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      nodeEnv: process.env.NODE_ENV,
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
          subject: String(subject ?? "General Inquiry").slice(0, 120),
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
    // Serve static assets with cache headers
    app.use(
      express.static(buildPath, {
        maxAge: "1y", // Cache for 1 year
        etag: false, // Disable etag (rely on immutable hashing)
      })
    );

    // SPA fallback: serve index.html for any unmatched routes
    app.get("*", (req, res) => {
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
