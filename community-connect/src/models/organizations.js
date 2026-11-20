import { pool } from "../database.js";
import { getAllCategories } from "./categories.js";

// Retrieve all organizations.
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

// Retrieve one organization.
export async function getOrganizationById(organizationId) {
  const query = `
    SELECT
      organizations.id,
      organizations.name,
      organizations.image,
      organizations.image_alt AS "imageAlt",
      organizations.description,
      organizations.mission,
      organizations.category_id AS "categoryId",
      categories.name AS category
    FROM organizations
    INNER JOIN categories
      ON organizations.category_id = categories.id
    WHERE organizations.id = $1;
  `;

  const result = await pool.query(query, [organizationId]);
  return result.rows[0];
}

// Retrieve projects belonging to an organization.
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

// Generate a unique organization slug.
async function getUniqueOrganizationSlug(name, excludeId = null) {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 210);

  const safeBaseSlug = baseSlug || "organization";
  let slug = safeBaseSlug;
  let suffix = 2;

  while (true) {
    const query = `
      SELECT id
      FROM organizations
      WHERE slug = $1
        AND ($2::integer IS NULL OR id <> $2);
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

// Prevent duplicate organization names.
async function organizationNameExists(name, excludeId = null) {
  const query = `
    SELECT id
    FROM organizations
    WHERE LOWER(name) = LOWER($1)
      AND ($2::integer IS NULL OR id <> $2)
    LIMIT 1;
  `;

  const result = await pool.query(query, [name, excludeId]);
  return result.rows.length > 0;
}

// Create an organization.
export async function createOrganization(data) {
  const name = data.name.trim();

  if (await organizationNameExists(name)) {
    const error = new Error("An organization with this name already exists.");
    error.code = "ORGANIZATION_DUPLICATE";
    throw error;
  }

  const slug = await getUniqueOrganizationSlug(name);

  const query = `
    INSERT INTO organizations (
      name,
      slug,
      category_id,
      image,
      image_alt,
      description,
      mission
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, slug;
  `;

  const values = [
    name,
    slug,
    Number(data.categoryId),
    data.image.trim(),
    data.imageAlt.trim(),
    data.description.trim(),
    data.mission.trim()
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Update an organization without changing its ID or projects.
export async function updateOrganization(organizationId, data) {
  const name = data.name.trim();

  if (await organizationNameExists(name, organizationId)) {
    const error = new Error("Another organization already uses this name.");
    error.code = "ORGANIZATION_DUPLICATE";
    throw error;
  }

  const slug = await getUniqueOrganizationSlug(name, organizationId);

  const query = `
    UPDATE organizations
    SET
      name = $1,
      slug = $2,
      category_id = $3,
      image = $4,
      image_alt = $5,
      description = $6,
      mission = $7
    WHERE id = $8
    RETURNING id, name, slug;
  `;

  const values = [
    name,
    slug,
    Number(data.categoryId),
    data.image.trim(),
    data.imageAlt.trim(),
    data.description.trim(),
    data.mission.trim(),
    organizationId
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export { getAllCategories };
