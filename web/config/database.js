// web/config/database.js
import pg from 'pg';

// PostgreSQL connection configuration
export const dbConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'shipping_app',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Create a PostgreSQL connection pool
const pool = new pg.Pool(dbConfig);

export default pool;