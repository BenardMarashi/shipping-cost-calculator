import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-04";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Use SQLite for session storage
const DB_PATH = `${process.cwd()}/database.sqlite`;
console.log(`Using SQLite session storage at path: ${DB_PATH}`);
const sessionStorage = new SQLiteSessionStorage(DB_PATH);

// Strip protocol from host
const hostName = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, "") : "";

const shopify = shopifyApp({
  api: {
    apiVersion: "2025-04",
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    // Default scopes if none are provided via SCOPES env
    scopes: process.env.SCOPES?.split(",") || ["write_products", "write_shipping"],
    hostName,
    restResources,
    billing: undefined,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },

  // IMPORTANT: Enforce SameSite=None and Secure for cookies (needed for embedded apps)
  sessionCookie: {
    secure: true,   // Must be true if SameSite=None
    sameSite: "none",
  },

  sessionStorage,
});

export default shopify;
