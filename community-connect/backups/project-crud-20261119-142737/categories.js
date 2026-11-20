import { pool } from "../database.js";

// Retrieve all categories from Supabase.
export async function getAllCategories() {
  const query = `
    SELECT
      id,
      name,
      slug,
      icon,
      description
    FROM categories
    ORDER BY id ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
}

// Retrieve one category by its ID.
export async function getCategoryById(categoryId) {
  const query = `
    SELECT
      id,
      name,
      slug,
      icon,
      description
    FROM categories
    WHERE id = $1;
  `;

  const result = await pool.query(query, [categoryId]);
  return result.rows[0];
}

// Retrieve all categories associated with a project.
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

// Retrieve all projects associated with a category.
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

// Generate a unique slug before inserting or updating a category.
async function getUniqueCategorySlug(name, excludeId = null) {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  const safeBaseSlug = baseSlug || "category";
  let slug = safeBaseSlug;
  let suffix = 2;

  while (true) {
    const query = `
      SELECT id
      FROM categories
      WHERE slug = $1
        AND ($2::integer IS NULL OR id <> $2);
    `;

    const result = await pool.query(query, [slug, excludeId]);

    if (result.rows.length === 0) {
      return slug;
    }

    const suffixText = `-${suffix}`;
    slug = `${safeBaseSlug.slice(0, 120 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }
}

// Check whether another category already uses this name.
async function categoryNameExists(name, excludeId = null) {
  const query = `
    SELECT id
    FROM categories
    WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
      AND ($2::integer IS NULL OR id <> $2)
    LIMIT 1;
  `;

  const result = await pool.query(query, [name, excludeId]);
  return result.rows.length > 0;
}

// Create a category.
export async function createCategory(name) {
  const trimmedName = name.trim();

  if (await categoryNameExists(trimmedName)) {
    const error = new Error("A category with this name already exists.");
    error.code = "CATEGORY_DUPLICATE";
    throw error;
  }

  const slug = await getUniqueCategorySlug(trimmedName);

  const query = `
    INSERT INTO categories (
      name,
      slug,
      icon,
      description
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, slug, icon, description;
  `;

  const values = [
    trimmedName,
    slug,
    "🤝",
    `Explore opportunities to make a difference through ${trimmedName.toLowerCase()}.`
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Update an existing category.
export async function updateCategory(categoryId, name) {
  const trimmedName = name.trim();

  if (await categoryNameExists(trimmedName, categoryId)) {
    const error = new Error("Another category already uses this name.");
    error.code = "CATEGORY_DUPLICATE";
    throw error;
  }

  const existingCategory = await getCategoryById(categoryId);

  if (!existingCategory) {
    return null;
  }

  const slug = await getUniqueCategorySlug(trimmedName, categoryId);

  const query = `
    UPDATE categories
    SET
      name = $1,
      slug = $2
    WHERE id = $3
    RETURNING id, name, slug, icon, description;
  `;

  const values = [trimmedName, slug, categoryId];

  const result = await pool.query(query, values);
  return result.rows[0];
}

