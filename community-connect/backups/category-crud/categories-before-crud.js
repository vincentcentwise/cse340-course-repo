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

// Retrieve one category by its ID
export async function getCategoryById(categoryId) {
  const query = `
    SELECT
      id,
      name,
      icon,
      description
    FROM categories
    WHERE id = $1;
  `;

  const result = await pool.query(query, [categoryId]);

  return result.rows[0];
}

// Retrieve all categories associated with a project
export async function getCategoriesByProjectId(projectId) {
  const query = `
    SELECT
      categories.id,
      categories.name,
      categories.icon,
      categories.description
    FROM categories
    INNER JOIN project_categories
      ON categories.id = project_categories.category_id
    WHERE project_categories.project_id = $1
    ORDER BY categories.name ASC;
  `;

  const result = await pool.query(query, [projectId]);

  return result.rows;
}

// Retrieve all projects associated with a category
export async function getProjectsByCategoryId(categoryId) {
  const query = `
    SELECT
      projects.id,
      projects.name,
      projects.image,
      projects.image_alt AS "imageAlt",
      projects.description,
      projects.location,
      projects.activity,
      organizations.name AS "organizationName"
    FROM projects
    INNER JOIN project_categories
      ON projects.id = project_categories.project_id
    INNER JOIN organizations
      ON projects.organization_id = organizations.id
    WHERE project_categories.category_id = $1
    ORDER BY projects.id ASC;
  `;

  const result = await pool.query(query, [categoryId]);

  return result.rows;
}
