import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Create a reusable PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log database connection errors
pool.on("error", (error) => {
  console.error("Unexpected database connection error:", error.message);
});