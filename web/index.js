import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import serveStatic from "serve-static";
import dotenv from "dotenv";
import { join } from "path";
import { readFileSync } from "fs";
import shopify from "./shopify.js";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "8081", 10);
const STATIC_PATH = `${process.cwd()}/frontend/dist/`;

// Create Express app
const app = express();

// CRITICAL: Trust proxy - required for Cloudflare tunnel
app.set("trust proxy", true);

// Middlewares
app.use(cookieParser(process.env.SHOPIFY_API_SECRET));
app.use(compression());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  console.log("Cookies:", req.cookies);
  next();
});

// Health check
app.get("/health", (_req, res) => res.status(200).send("OK"));

// Set CORS headers for all routes
app.use((req, res, next) => {
  const shop = req.query.shop;
  if (shop) {
    res.setHeader("Access-Control-Allow-Origin", `https://${shop}`);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// Shopify Auth
app.get("/api/auth", shopify.auth.begin());

app.get("/api/auth/callback", shopify.auth.callback(), (req, res) => {
  console.log("Auth successful! Redirecting...");
  // After successful auth, redirect to app with shop parameter
  const shop = req.query.shop;
  res.redirect(`/?shop=${shop}`);
});

// Explicitly log out route for testing
app.get("/api/auth/logout", async (req, res) => {
  try {
    await shopify.sessionStorage.deleteSessions(req.query.shop);
    res.clearCookie("shopify_app_session");
    res.redirect(`/?shop=${req.query.shop}`);
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Error during logout");
  }
});

// Static file serving
app.use(serveStatic(STATIC_PATH, { index: false }));

// Root with shop param
app.get("/", (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(200).send(`
      <html>
        <body>
          <h1>Shopify App</h1>
          <p>Add ?shop=yourstore.myshopify.com to the URL</p>
        </body>
      </html>
    `);
  }
  
  // Check if we have a session already
  shopify.api.session.getCurrentId({
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  }).then(sessionId => {
    console.log(`Checking for session: ${sessionId}`);
    if (!sessionId) {
      // No session, start OAuth
      console.log("No session found, redirecting to OAuth");
      return shopify.auth.begin({ shop })(req, res);
    }
    
    // We have a session, serve the app
    try {
      const indexPath = join(STATIC_PATH, "index.html");
      const indexContent = readFileSync(indexPath, "utf8");
      const modifiedIndex = indexContent
        .replace(/%VITE_SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "")
        .replace(/%VITE_HOST%/g, process.env.HOST || "");
      
      res.status(200)
        .set("Content-Type", "text/html")
        .send(modifiedIndex);
    } catch (error) {
      console.error("Error serving index:", error);
      res.status(500).send("Error loading app");
    }
  }).catch(error => {
    console.error("Session check error:", error);
    res.status(500).send("Error checking session");
  });
});

// All other routes - serve frontend
app.use("/*", async (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.redirect("/");
  }
  
  try {
    const indexPath = join(STATIC_PATH, "index.html");
    const indexContent = readFileSync(indexPath, "utf8");
    const modifiedIndex = indexContent
      .replace(/%VITE_SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "")
      .replace(/%VITE_HOST%/g, process.env.HOST || "");
    
    res.status(200)
      .set("Content-Type", "text/html")
      .send(modifiedIndex);
  } catch (error) {
    console.error("Error serving index:", error);
    res.status(500).send("Error loading app");
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});