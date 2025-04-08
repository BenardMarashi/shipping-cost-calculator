// test-server.js
import express from "express";
import { join } from "path";
import { readFileSync } from "fs";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "8081", 10);
const STATIC_PATH = `${process.cwd()}/frontend/`;

const app = express();

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});