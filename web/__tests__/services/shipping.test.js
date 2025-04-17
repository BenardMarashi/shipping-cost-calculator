import { jest } from '@jest/globals';
import { calculateShippingRates } from '../../services/shipping.js';

// Mock the carrier model
jest.mock('../../models/carrier.js', () => ({
  __esModule: true,
  getAllCarriers: jest.fn()
}));

// Import the mocked function
import { getAllCarriers } from '../../models/carrier.js';

describe('Shipping Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateShippingRates', () => {
    it('should return empty rates array if no carriers are configured', async () => {
      // Mock empty carriers list
      getAllCarriers.mockResolvedValue([]);
      
      const rateRequest = {
        rate: {
          items: [
            { grams: 1000, quantity: 2 }
          ]
        }
      };
      
      const result = await calculateShippingRates(rateRequest);
      
      expect(result).toEqual({ success: true, rates: [] });
      expect(getAllCarriers).toHaveBeenCalled();
    });
    
    it('should calculate rates for single parcel order', async () => {
      // Mock carriers
      getAllCarriers.mockResolvedValue([
        { name: 'DPD', price: 1000 },
        { name: 'Post', price: 1200 }
      ]);
      
      // Create rate request with 5kg total
      const rateRequest = {
        rate: {
          items: [
            { grams: 2500, quantity: 2 } // 5kg total
          ],
          currency: "EUR"
        }
      };
      
      const result = await calculateShippingRates(rateRequest);
      
      // Should return DPD as the cheapest with one parcel
      expect(result.success).toBe(true);
      expect(result.rates.length).toBe(1);
      expect(result.rates[0].service_name).toBe('DPD (1 parcel)');
      expect(result.rates[0].total_price).toBe(1000); // Single parcel price
    });
    
    it('should calculate rates for multi-parcel order', async () => {
      // Mock carriers
      getAllCarriers.mockResolvedValue([
        { name: 'DPD', price: 1000 },
        { name: 'Post', price: 900 } // Post is cheaper per parcel
      ]);
      
      // Create rate request with 70kg total (requiring 3 parcels)
      const rateRequest = {
        rate: {
          items: [
            { grams: 35000, quantity: 2 } // 70kg total
          ],
          currency: "EUR"
        }
      };
      
      const result = await calculateShippingRates(rateRequest);
      
      // Should return Post as the cheapest with three parcels
      expect(result.success).toBe(true);
      expect(result.rates.length).toBe(1);
      expect(result.rates[0].service_name).toBe('Post (3 parcels)');
      expect(result.rates[0].total_price).toBe(900 * 3); // Three parcels
    });
    
    it('should handle errors and return error object', async () => {
      // Mock an error
      getAllCarriers.mockRejectedValue(new Error('Database error'));
      
      const rateRequest = {
        rate: {
          items: [
            { grams: 1000, quantity: 1 }
          ]
        }
      };
      
      const result = await calculateShippingRates(rateRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});