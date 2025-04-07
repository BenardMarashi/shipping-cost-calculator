// web/models/carrier.js
import pool from '../config/database.js';

export async function initializeCarriersTable() {
  const client = await pool.connect();
  try {
    // Create carriers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS carriers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if carriers table is empty and add default carriers if needed
    const { rows } = await client.query('SELECT COUNT(*) AS count FROM carriers');
    if (parseInt(rows[0].count) === 0) {
      await client.query(
        'INSERT INTO carriers (name, price) VALUES ($1, $2), ($3, $4)',
        ['DPD', 1000, 'Post', 1200]
      );
      console.log('Initialized default carriers');
    }
  } catch (error) {
    console.error('Error initializing carriers table:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getAllCarriers() {
  const { rows } = await pool.query('SELECT * FROM carriers ORDER BY name');
  return rows;
}

export async function createCarrier(name, price) {
  const { rows } = await pool.query(
    'INSERT INTO carriers (name, price) VALUES ($1, $2) RETURNING *',
    [name, price]
  );
  return rows[0];
}

export async function updateCarrierPrice(name, price) {
  const { rowCount, rows } = await pool.query(
    'UPDATE carriers SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2 RETURNING *',
    [price, name]
  );
  return { changes: rowCount, carrier: rows[0] };
}

export async function removeCarrier(name) {
  const { rowCount } = await pool.query('DELETE FROM carriers WHERE name = $1', [name]);
  return { changes: rowCount };
}