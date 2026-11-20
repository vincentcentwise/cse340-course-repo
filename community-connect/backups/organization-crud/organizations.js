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

// Retrieve one organization by its ID
export async function getOrganizationById(organizationId) {
  const query = `
    SELECT
      organizations.id,
      organizations.name,
      organizations.image,
      organizations.image_alt AS "imageAlt",
      organizations.description,
      organizations.mission,
      categories.id AS "categoryId",
      categories.name AS category
    FROM organizations
    INNER JOIN categories
      ON organizations.category_id = categories.id
    WHERE organizations.id = $1;
  `;

  const result = await pool.query(query, [organizationId]);

  return result.rows[0];
}

// Retrieve all projects belonging to an organization
export async function getProjectsByOrganizationId(organizationId) {
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
    WHERE projects.organization_id = $1
    GROUP BY projects.id
    ORDER BY projects.id ASC;
  `;

  const result = await pool.query(query, [organizationId]);

  return result.rows;
}
