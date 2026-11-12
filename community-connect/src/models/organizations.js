
import { pool } from "../database.js";

// Retrieve all organizations from Supabase
export async function getAllOrganizations() {
  const query = `
    SELECT
      organizations.id,
      organizations.name,
      organizations.image,
      organizations.image_alt AS "imageAlt",
      organizations.description,
      organizations.mission,
      categories.name AS category
    FROM organizations
    INNER JOIN categories
      ON organizations.category_id = categories.id
    ORDER BY organizations.id ASC;
  `;

  const result = await pool.query(query);

  return result.rows;
}
