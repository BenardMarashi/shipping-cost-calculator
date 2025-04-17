import { jest } from '@jest/globals';
import { registerCarrierService } from '../../services/carrier.js';

// Mock the Shopify API
jest.mock('../../shopify.js', () => {
  const mockCarrierService = {
    save: jest.fn().mockResolvedValue(true)
  };

  return {
    __esModule: true,
    default: {
      api: {
        rest: {
          CarrierService: jest.fn().mockImplementation(() => mockCarrierService)
        }
      }
    }
  };
});

// Import mocked module
import shopify from '../../shopify.js';

describe('Carrier Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.HOST = 'https://test-shop.myshopify.com';
  });

  describe('registerCarrierService', () => {
    it('should successfully register a carrier service', async () => {
      const mockSession = { accessToken: 'test_token', shop: 'test-shop.myshopify.com' };
      const carrierServiceMock = shopify.api.rest.CarrierService();
      
      const result = await registerCarrierService(mockSession);
      
      // Check if carrier service was configured correctly
      expect(shopify.api.rest.CarrierService).toHaveBeenCalledWith({ session: mockSession });
      expect(carrierServiceMock.name).toBe('RuleBasedShipping');
      expect(carrierServiceMock.callback_url).toBe('https://test-shop.myshopify.com/carrier-service');
      expect(carrierServiceMock.service_discovery).toBe(true);
      
      // Check if save was called with update: true
      expect(carrierServiceMock.save).toHaveBeenCalledWith({ update: true });
      
      // Should return success
      expect(result).toEqual({ success: true });
    });
    
    it('should handle errors during registration', async () => {
      const mockSession = { accessToken: 'test_token', shop: 'test-shop.myshopify.com' };
      const error = new Error('API error');
      
      // Override the mock to throw an error
      const carrierServiceMock = shopify.api.rest.CarrierService();
      carrierServiceMock.save.mockRejectedValueOnce(error);
      
      const result = await registerCarrierService(mockSession);
      
      // Should return failure with error message
      expect(result).toEqual({ 
        success: false, 
        error: 'API error'
      });
    });
  });
});