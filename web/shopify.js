// web/shopify.js
import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-04"; // Use 2025-04 to match the default
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// PostgreSQL configuration from docker-compose.yml
const dbConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432, 
  database: process.env.PG_DATABASE || 'shipping_app',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Initialize session storage with PostgreSQL
const sessionStorage = new PostgreSQLSessionStorage(dbConfig);

// Strip protocol from host
const hostName = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : '';

const shopify = shopifyApp({
  api: {
    apiVersion: "2025-04", // Match the API version to the webhook version
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES?.split(',') || ['write_products', 'write_shipping'],
    hostName: hostName,
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
  sessionStorage,
});

export default shopify;