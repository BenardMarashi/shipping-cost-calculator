// web/services/shipping.js
import { getAllCarriers } from '../models/carrier.js';

/**
 * Calculates shipping rates based on weight and carrier options
 * @param {Object} rateRequest - Shopify rate request object
 * @returns {Object} - Calculated shipping rates
 */
export async function calculateShippingRates(rateRequest) {
  try {
    // Get carriers from database
    const carriers = await getAllCarriers();
    
    if (carriers.length === 0) {
      console.log("No carriers configured");
      return { success: true, rates: [] };
    }

    // Sum up total weight (in grams)
    const totalWeightGrams = rateRequest.rate.items.reduce(
      (acc, item) => acc + item.grams * item.quantity,
      0
    );

    // Convert grams to kg
    const totalWeightKg = totalWeightGrams / 1000;
    const maxParcelWeight = 31.5; // Maximum weight per parcel in kg
    
    // Calculate number of parcels needed (round up)
    const parcels = Math.ceil(totalWeightKg / maxParcelWeight);
    
    console.log(`Order weight: ${totalWeightKg}kg, requires ${parcels} parcel(s)`);

    // Build rates for each carrier
    const rates = carriers.map((carrier) => ({
      service_name: `${carrier.name} (${parcels} parcel${parcels > 1 ? "s" : ""})`,
      service_code: carrier.name.toLowerCase(),
      total_price: carrier.price * parcels, // price is in cents, e.g. 1000 => €10
      currency: rateRequest.rate.currency || "EUR", // Use store's currency or default to EUR
      min_delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(), // Tomorrow
      max_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
      description: `Delivery via ${carrier.name}, split into ${parcels} parcel(s)`,
    }));

    // Sort rates by price (ascending) and pick the cheapest
    rates.sort((a, b) => a.total_price - b.total_price);
    const cheapestRate = rates[0];
    
    console.log("Returning cheapest rate:", cheapestRate);
    
    // Return only the cheapest rate to Shopify
    return { success: true, rates: [cheapestRate] };
  } catch (error) {
    console.error("Error calculating shipping rates:", error);
    return { success: false, error: error.message };
  }
}