
import { pool } from "../database.js";

// Retrieve all projects and their associated categories from Supabase
export async function getAllProjects() {
  const query = `
    SELECT
      projects.id,
      projects.name,
      projects.image,
      projects.image_alt AS "imageAlt",
      projects.description,
      projects.location,
      projects.activity,
      COALESCE(
        STRING_AGG(categories.name, ', ' ORDER BY categories.name),
        'Uncategorized'
      ) AS category
    FROM projects
    LEFT JOIN project_categories
      ON projects.id = project_categories.project_id
    LEFT JOIN categories
      ON project_categories.category_id = categories.id
    GROUP BY projects.id
    ORDER BY projects.id ASC;
  `;

  const result = await pool.query(query);

  return result.rows;
}
