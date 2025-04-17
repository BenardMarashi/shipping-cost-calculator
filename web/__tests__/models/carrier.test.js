import { jest } from '@jest/globals';
import { 
  initializeCarriersTable, 
  getAllCarriers, 
  createCarrier,
  updateCarrierPrice,
  removeCarrier 
} from '../../models/carrier.js';

// Mock the database pool
jest.mock('../../config/database.js', () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn().mockReturnValue({
    query: mockQuery,
    release: jest.fn()
  });
  
  return {
    __esModule: true,
    default: {
      query: mockQuery,
      connect: mockConnect
    }
  };
});

// Import the mocked module
import pool from '../../config/database.js';

describe('Carrier Model', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('initializeCarriersTable', () => {
    it('should create table and add default carriers if table is empty', async () => {
      // Mock query responses
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      
      // First query creates table, second checks count, third inserts defaults
      mockClient.query
        .mockResolvedValueOnce({ rowCount: 0 }) // CREATE TABLE result
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // SELECT COUNT result
        .mockResolvedValueOnce({ rowCount: 2 }); // INSERT result
      
      pool.connect.mockResolvedValue(mockClient);
      
      await initializeCarriersTable();
      
      // Check if table was created
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS carriers'));
      
      // Check if defaults were inserted
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO carriers'),
        expect.arrayContaining(['DPD', 1000, 'Post', 1200])
      );
      
      // Check if client was released
      expect(mockClient.release).toHaveBeenCalled();
    });
    
    it('should not add default carriers if table already has data', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      
      mockClient.query
        .mockResolvedValueOnce({ rowCount: 0 }) // CREATE TABLE result
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }); // SELECT COUNT result with data
      
      pool.connect.mockResolvedValue(mockClient);
      
      await initializeCarriersTable();
      
      // Should not insert defaults
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO carriers'),
        expect.any(Array)
      );
    });
  });

  describe('getAllCarriers', () => {
    it('should return all carriers ordered by name', async () => {
      const mockCarriers = [
        { id: 1, name: 'DPD', price: 1000 },
        { id: 2, name: 'Post', price: 1200 }
      ];
      
      pool.query.mockResolvedValue({ rows: mockCarriers });
      
      const result = await getAllCarriers();
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM carriers ORDER BY name');
      expect(result).toEqual(mockCarriers);
    });
  });

  describe('createCarrier', () => {
    it('should insert a new carrier and return it', async () => {
      const newCarrier = { id: 3, name: 'DHL', price: 1500 };
      
      pool.query.mockResolvedValue({ rows: [newCarrier] });
      
      const result = await createCarrier('DHL', 1500);
      
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO carriers (name, price) VALUES ($1, $2) RETURNING *',
        ['DHL', 1500]
      );
      expect(result).toEqual(newCarrier);
    });
  });

  describe('updateCarrierPrice', () => {
    it('should update carrier price and return update info', async () => {
      const updatedCarrier = { id: 1, name: 'DPD', price: 1100 };
      
      pool.query.mockResolvedValue({ rowCount: 1, rows: [updatedCarrier] });
      
      const result = await updateCarrierPrice('DPD', 1100);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE carriers SET price = $1'),
        [1100, 'DPD']
      );
      expect(result).toEqual({ changes: 1, carrier: updatedCarrier });
    });
    
    it('should return zero changes if carrier not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0, rows: [] });
      
      const result = await updateCarrierPrice('NonExistentCarrier', 1000);
      
      expect(result).toEqual({ changes: 0, carrier: undefined });
    });
  });

  describe('removeCarrier', () => {
    it('should delete a carrier and return number of changes', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      
      const result = await removeCarrier('DPD');
      
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM carriers WHERE name = $1',
        ['DPD']
      );
      expect(result).toEqual({ changes: 1 });
    });
    
    it('should return zero changes if carrier not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      
      const result = await removeCarrier('NonExistentCarrier');
      
      expect(result).toEqual({ changes: 0 });
    });
  });
});