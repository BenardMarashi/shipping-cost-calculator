// web/index.js
import express from "express";
import dotenv from 'dotenv';
import { join } from "path";
import { readFileSync } from "fs";

// Load environment variables
dotenv.config();

import shopify from "./shopify.js";

const PORT = parseInt(process.env.PORT || "8081", 10);
const STATIC_PATH = `${process.cwd()}/frontend/`;

const app = express();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root path
app.get('/', (req, res) => {
  res.status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace(/%VITE_SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "")
    );
});

// Fallback route for SPA
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