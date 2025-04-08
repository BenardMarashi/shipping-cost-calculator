// index.js - gradual approach
import express from "express";
import { join } from "path";
import { readFileSync } from "fs";
import dotenv from 'dotenv';
import serveStatic from "serve-static";

// Load environment variables
dotenv.config();

import shopify from "./shopify.js";
// Don't import additional modules yet

const PORT = parseInt(process.env.PORT || "8081", 10);
const STATIC_PATH = process.env.NODE_ENV === "production"
  ? `${process.cwd()}/frontend/dist`
  : `${process.cwd()}/frontend/`;

const app = express();

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Basic Shopify auth routes
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Use middleware
app.use(express.json());
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// Catch-all route for serving the frontend
app.get('*', (req, res) => {
  console.log(`Serving index.html for path: ${req.originalUrl}`);
  
  res.status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace(/%VITE_SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});