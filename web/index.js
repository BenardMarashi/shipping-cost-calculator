// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import { initializeCarriersTable } from "./models/carrier.js";
import carriersRoutes from "./routes/carriers.js";
import { registerCarrierService } from "./services/carrier.js";
import { calculateShippingRates } from "./services/shipping.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Initialize database tables
initializeCarriersTable().catch(console.error);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// API Routes
app.use("/api/carriers", carriersRoutes);

// Carrier Service endpoint - does not require authenticated session
app.post("/carrier-service", express.json(), async (req, res) => {
  try {
    const rates = await calculateShippingRates(req.body);
    res.json(rates);
  } catch (error) {
    console.error("Carrier service error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to calculate shipping rates"
    });
  }
});

// Register carrier service after app installs
app.get("/api/register-carrier", async (req, res) => {
  try {
    const result = await registerCarrierService(res.locals.shopify.session);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error registering carrier service:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to register carrier service" 
    });
  }
});

app.get("/api/products/count", async (req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// IMPROVED: Better handling of embedded app parameters
function serveIndexHtml(req, res) {
  // Get the full URL including all query parameters
  const url = req.originalUrl;
  const shopifyHost = req.query.host;
  
  console.log("Serving index.html for URL:", url);
  console.log("Shopify Host:", shopifyHost);
  
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "15bec6dd27c82c64aa1e66c353f71777")
    );
}

// Use the improved middleware function
app.use("/*", shopify.ensureInstalledOnShop(), serveIndexHtml);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});