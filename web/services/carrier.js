// web/services/carrier.js
import shopify from '../shopify.js';

export async function registerCarrierService(session) {
  try {
    const carrier = new shopify.api.rest.CarrierService({ session });
    carrier.name = "RuleBasedShipping";
    carrier.callback_url = `${process.env.HOST}/carrier-service`;
    carrier.service_discovery = true;

    await carrier.save({ update: true });
    console.log("✅ Carrier Service registered successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error registering Carrier Service:", error.message);
    return { success: false, error: error.message };
  }
}