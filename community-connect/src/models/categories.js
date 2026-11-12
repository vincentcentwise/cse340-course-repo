
import { pool } from "../database.js";

// Retrieve all categories from Supabase
export async function getAllCategories() {
  const query = `
    SELECT
      id,
      name,
      icon,
      description
    FROM categories
    ORDER BY id ASC;
  `;

  const result = await pool.query(query);

  return result.rows;
}
