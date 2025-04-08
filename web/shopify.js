// web/shopify.js
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-04";
import { LogSeverity } from "@shopify/shopify-api";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try different possible locations for the .env file
const possibleEnvPaths = [
  join(__dirname, '..', '.env'),          // Root directory
  join(__dirname, '.env'),                // Web directory
  join(process.cwd(), '.env'),            // Current working directory
];

let envLoaded = false;
for (const path of possibleEnvPaths) {
  if (existsSync(path)) {
    console.log(`Loading environment from: ${path}`);
    dotenv.config({ path });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("Warning: Could not find .env file in any common location!");
}

// Hard-code critical environment variables if they're not loaded
// This is a fallback for when running with 'node index.js' directly
if (!process.env.SHOPIFY_API_KEY) {
  process.env.SHOPIFY_API_KEY = "15bec6dd27c82c64aa1e66c353f71777";
}

if (!process.env.SHOPIFY_API_SECRET) {
  process.env.SHOPIFY_API_SECRET = "81aa45a7b50200a73d8b7a1a21f74e1f";
}

if (!process.env.HOST) {
  process.env.HOST = "https://sharp-why-films-weekend.trycloudflare.com";
}

if (!process.env.SCOPES) {
  process.env.SCOPES = "write_products,write_shipping";
}

// Verify environment variables are loaded
console.log("Environment variables after fallback:");
console.log("SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY);
console.log("API Secret length:", process.env.SHOPIFY_API_SECRET?.length);
console.log("HOST:", process.env.HOST);
console.log("SCOPES:", process.env.SCOPES);

// Use SQLite for session storage
const DB_PATH = `${process.cwd()}/database.sqlite`;
console.log(`Using SQLite session storage at path: ${DB_PATH}`);
const sessionStorage = new SQLiteSessionStorage(DB_PATH);

// Parse host properly - critical for cookie domains
const hostName = process.env.HOST ? 
  process.env.HOST.replace(/https?:\/\//, "") : "";

const shopify = shopifyApp({
  api: {
    apiVersion: "2025-04",
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES?.split(",") || ["write_products", "write_shipping"],
    hostName,
    restResources,
    billing: undefined,
    isEmbeddedApp: true,
    // Enable debug logging
    logger: {
      level: LogSeverity.Debug,
      httpRequests: true,
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // Critical for cross-domain cookies with Cloudflare tunnel
  sessionCookie: {
    name: "shopify_app_session",
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
  sessionStorage,
});

export default shopify;