// index.js (Improved Debug Version)

import express from "express";
import compression from "compression";
import serveStatic from "serve-static";
import dotenv from "dotenv";
import { join } from "path";
import { readFileSync } from "fs";
import shopify from "./shopify.js";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "8081", 10);
const HOST = process.env.HOST || `http://localhost:${PORT}`;
const STATIC_PATH = `${process.cwd()}/frontend/dist/`;

// Check required ENV vars
["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SCOPES", "HOST"].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[WARNING] Missing .env variable: ${key}`);
  }
});

console.log("STATIC_PATH:", STATIC_PATH);

// Create Express app
const app = express();

// Ensure Express respects HTTPS when behind Cloudflare
app.set("trust proxy", 1);

// Middlewares
app.use(compression());
app.use(express.json());

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Health check
app.get("/health", (_req, res) => res.status(200).send("OK"));

// Shopify Auth Routes
app.get("/api/auth", (req, res, next) => {
  console.log("[AUTH] Begin triggered:", req.query);
  return shopify.auth.begin()(req, res, next);
});

app.get("/api/auth/callback", async (req, res, next) => {
  try {
    console.log("[AUTH] Callback triggered with:", req.query);
    await shopify.auth.callback()(req, res, next);
  } catch (err) {
    console.error("[AUTH ERROR]", err.message, err);
    res.status(500).send("OAuth Callback Error");
  }
}, shopify.redirectToShopifyOrAppRoot());

// Serve static files
app.use(serveStatic(STATIC_PATH, { index: false }));

// Root route with optional shop param
app.get("/", async (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(200).send(`
      <html>
        <body>
          <h1>Shopify App</h1>
          <p>Please add a shop param like: <a href="/?shop=yourshop.myshopify.com">Start here</a></p>
        </body>
      </html>
    `);
  }

  console.log("[ROOT] Starting auth for shop:", shop);
  return shopify.auth.begin({ shop })(req, res);
});

// Catch-all for frontend
app.use("/*", (req, res) => {
  const shop = req.query.shop;
  const indexPath = join(STATIC_PATH, "index.html");

  try {
    const html = readFileSync(indexPath, "utf8");
    const replacedHtml = html.replace(/%VITE_SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "");

    if (!shop) {
      console.warn("[CATCH-ALL] No shop param, redirecting to /");
      return res.redirect("/");
    }

    return res.status(200).set("Content-Type", "text/html").send(replacedHtml);
  } catch (err) {
    console.error("Error reading index.html:", err);
    res.status(500).send("Frontend not found");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Server running on ${HOST}`);
});
