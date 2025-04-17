import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import carriersRouter from '../../routes/carriers.js';

// Mock the carrier model
jest.mock('../../models/carrier.js', () => ({
  __esModule: true,
  getAllCarriers: jest.fn(),
  createCarrier: jest.fn(),
  updateCarrierPrice: jest.fn(),
  removeCarrier: jest.fn()
}));

// Import mocked functions
import { 
  getAllCarriers, 
  createCarrier, 
  updateCarrierPrice, 
  removeCarrier 
} from '../../models/carrier.js';

// Set up Express app for testing
const app = express();
app.use(express.json());
app.use('/api/carriers', carriersRouter);

describe('Carriers API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/carriers', () => {
    it('should return all carriers', async () => {
      const mockCarriers = [
        { id: 1, name: 'DPD', price: 1000 },
        { id: 2, name: 'Post', price: 1200 }
      ];
      
      getAllCarriers.mockResolvedValue(mockCarriers);
      
      const response = await request(app).get('/api/carriers');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCarriers);
      expect(getAllCarriers).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      getAllCarriers.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/api/carriers');
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/carriers', () => {
    it('should create a new carrier', async () => {
      const newCarrier = { name: 'DHL', price: 1500 };
      const mockCarriers = [
        { id: 1, name: 'DPD', price: 1000 },
        { id: 2, name: 'Post', price: 1200 },
        { id: 3, name: 'DHL', price: 1500 }
      ];
      
      createCarrier.mockResolvedValue({ id: 3, ...newCarrier });
      getAllCarriers.mockResolvedValue(mockCarriers);
      
      const response = await request(app)
        .post('/api/carriers')
        .send(newCarrier);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.carriers).toEqual(mockCarriers);
      expect(createCarrier).toHaveBeenCalledWith('DHL', 1500);
    });
    
    it('should validate input', async () => {
      const response = await request(app)
        .post('/api/carriers')
        .send({ name: '', price: -10 });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(createCarrier).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/carriers/:name', () => {
    it('should update carrier price', async () => {
      const updatedCarriers = [
        { id: 1, name: 'DPD', price: 1100 },
        { id: 2, name: 'Post', price: 1200 }
      ];
      
      updateCarrierPrice.mockResolvedValue({ 
        changes: 1, 
        carrier: { id: 1, name: 'DPD', price: 1100 } 
      });
      getAllCarriers.mockResolvedValue(updatedCarriers);
      
      const response = await request(app)
        .put('/api/carriers/DPD')
        .send({ price: 1100 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.carriers).toEqual(updatedCarriers);
      expect(updateCarrierPrice).toHaveBeenCalledWith('DPD', 1100);
    });
    
    it('should return 404 if carrier not found', async () => {
      updateCarrierPrice.mockResolvedValue({ changes: 0 });
      
      const response = await request(app)
        .put('/api/carriers/NonExistentCarrier')
        .send({ price: 1000 });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/carriers/:name', () => {
    it('should delete a carrier', async () => {
      const remainingCarriers = [
        { id: 2, name: 'Post', price: 1200 }
      ];
      
      removeCarrier.mockResolvedValue({ changes: 1 });
      getAllCarriers.mockResolvedValue(remainingCarriers);
      
      const response = await request(app)
        .delete('/api/carriers/DPD');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.carriers).toEqual(remainingCarriers);
      expect(removeCarrier).toHaveBeenCalledWith('DPD');
    });
    
    it('should return 404 if carrier not found', async () => {
      removeCarrier.mockResolvedValue({ changes: 0 });
      
      const response = await request(app)
        .delete('/api/carriers/NonExistentCarrier');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});