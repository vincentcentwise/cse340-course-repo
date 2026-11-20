import { pool } from "../database.js";

// Retrieve the next five upcoming projects.
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

// Retrieve one project with its organization details and date.
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

// Retrieve organizations for project forms.
export async function getAllOrganizationsForProjects() {
  const query = `
    SELECT id, name
    FROM organizations
    ORDER BY name ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
}

// Generate a unique project slug.
async function getUniqueProjectSlug(name, excludeId = null) {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 210);

  const safeBaseSlug = baseSlug || "project";
  let slug = safeBaseSlug;
  let suffix = 2;

  while (true) {
    const query = `
      SELECT id
      FROM projects
      WHERE slug = $1
        AND ($2::integer IS NULL OR id <> $2)
      LIMIT 1;
    `;

    const result = await pool.query(query, [slug, excludeId]);

    if (result.rows.length === 0) {
      return slug;
    }

    const suffixText = `-${suffix}`;
    slug = `${safeBaseSlug.slice(0, 220 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }
}

// Check for duplicate project names.
async function projectNameExists(name, excludeId = null) {
  const query = `
    SELECT id
    FROM projects
    WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
      AND ($2::integer IS NULL OR id <> $2)
    LIMIT 1;
  `;

  const result = await pool.query(query, [name, excludeId]);
  return result.rows.length > 0;
}

// Create a project.
export async function createProject(data) {
  const name = data.name.trim();

  if (await projectNameExists(name)) {
    const error = new Error("A project with this name already exists.");
    error.code = "PROJECT_DUPLICATE";
    throw error;
  }

  const slug = await getUniqueProjectSlug(name);

  const query = `
    INSERT INTO projects (
      name,
      slug,
      organization_id,
      image,
      image_alt,
      description,
      location,
      activity,
      project_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, slug;
  `;

  const values = [
    name,
    slug,
    Number(data.organizationId),
    data.image.trim(),
    data.imageAlt.trim(),
    data.description.trim(),
    data.location.trim(),
    data.activity.trim(),
    data.projectDate || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Update an existing project.
export async function updateProject(projectId, data) {
  const name = data.name.trim();

  if (await projectNameExists(name, projectId)) {
    const error = new Error("Another project already uses this name.");
    error.code = "PROJECT_DUPLICATE";
    throw error;
  }

  const slug = await getUniqueProjectSlug(name, projectId);

  const query = `
    UPDATE projects
    SET
      name = $1,
      slug = $2,
      organization_id = $3,
      image = $4,
      image_alt = $5,
      description = $6,
      location = $7,
      activity = $8,
      project_date = $9
    WHERE id = $10
    RETURNING id, name, slug;
  `;

  const values = [
    name,
    slug,
    Number(data.organizationId),
    data.image.trim(),
    data.imageAlt.trim(),
    data.description.trim(),
    data.location.trim(),
    data.activity.trim(),
    data.projectDate || null,
    projectId
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}