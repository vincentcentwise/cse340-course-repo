import { pool } from "../database.js";

// Replace all category assignments for a project safely.
export async function replaceProjectCategories(projectId, categoryIds) {
  if (!Number.isSafeInteger(Number(projectId)) || Number(projectId) < 1) {
    const error = new Error("Invalid project ID.");
    error.code = "INVALID_PROJECT_ID";
    throw error;
  }

  if (!Array.isArray(categoryIds)) {
    const error = new Error("Category selections must be an array.");
    error.code = "INVALID_CATEGORY_IDS";
    throw error;
  }

  const normalizedIds = [...new Set(categoryIds.map(Number))];

  if (normalizedIds.some(id => !Number.isSafeInteger(id) || id < 1)) {
    const error = new Error("One or more selected categories are invalid.");
    error.code = "INVALID_CATEGORY_IDS";
    throw error;
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Confirm that the project exists.
    const projectResult = await client.query(
      "SELECT id FROM projects WHERE id = $1 FOR UPDATE;",
      [Number(projectId)]
    );

    if (projectResult.rows.length === 0) {
      const error = new Error("The selected project does not exist.");
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    // Confirm that every selected category exists.
    if (normalizedIds.length > 0) {
      const categoryResult = await client.query(
        "SELECT id FROM categories WHERE id = ANY($1::integer[]);",
        [normalizedIds]
      );

      if (categoryResult.rows.length !== normalizedIds.length) {
        const error = new Error("One or more selected categories do not exist.");
        error.code = "INVALID_CATEGORY_IDS";
        throw error;
      }
    }

    // Remove the project's previous category assignments.
    await client.query(
      "DELETE FROM project_categories WHERE project_id = $1;",
      [Number(projectId)]
    );

    // Insert the newly selected categories.
    if (normalizedIds.length > 0) {
      await client.query(
        `
          INSERT INTO project_categories (project_id, category_id)
          SELECT $1, selected.category_id
          FROM UNNEST($2::integer[]) AS selected(category_id);
        `,
        [Number(projectId), normalizedIds]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return normalizedIds;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Category assignment rollback failed:", rollbackError.message);
      }
    }

    throw error;
  } finally {
    client.release();
  }
}