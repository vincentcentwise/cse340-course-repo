import { pool } from "../database.js";

// Retrieve the next five upcoming projects
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
      TO_CHAR(projects.project_date, 'YYYY-MM-DD') AS "projectDate",
      organizations.id AS "organizationId",
      organizations.name AS "organizationName",
      COALESCE(
        STRING_AGG(categories.name, ', ' ORDER BY categories.name),
        'Uncategorized'
      ) AS category
    FROM projects
    INNER JOIN organizations
      ON projects.organization_id = organizations.id
    LEFT JOIN project_categories
      ON projects.id = project_categories.project_id
    LEFT JOIN categories
      ON project_categories.category_id = categories.id
    WHERE projects.project_date >= CURRENT_DATE
    GROUP BY projects.id, organizations.id, organizations.name
    ORDER BY projects.project_date ASC, projects.id ASC
    LIMIT 5;
  `;

  const result = await pool.query(query);

  return result.rows;
}

// Retrieve one project with its organization details and date
export async function getProjectById(projectId) {
  const query = `
    SELECT
      projects.id,
      projects.name,
      projects.image,
      projects.image_alt AS "imageAlt",
      projects.description,
      projects.location,
      projects.activity,
      TO_CHAR(projects.project_date, 'YYYY-MM-DD') AS "projectDate",
      organizations.id AS "organizationId",
      organizations.name AS "organizationName",
      organizations.image AS "organizationImage"
    FROM projects
    INNER JOIN organizations
      ON projects.organization_id = organizations.id
    WHERE projects.id = $1;
  `;

  const result = await pool.query(query, [projectId]);

  return result.rows[0];
}
