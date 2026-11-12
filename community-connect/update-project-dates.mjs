import { pool } from "./src/database.js";

async function updateProjectDates() {
  try {
    await pool.query("BEGIN");

    await pool.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS project_date DATE;
    `);

    await pool.query(`
      UPDATE projects
      SET project_date = CASE slug
        WHEN 'community-tree-planting' THEN DATE '2026-11-20'
        WHEN 'free-digital-literacy-training' THEN DATE '2026-11-27'
        WHEN 'community-health-outreach' THEN DATE '2026-12-04'
        WHEN 'neighborhood-clean-up-campaign' THEN DATE '2026-12-11'
        ELSE project_date
      END
      WHERE slug IN (
        'community-tree-planting',
        'free-digital-literacy-training',
        'community-health-outreach',
        'neighborhood-clean-up-campaign'
      );
    `);

    await pool.query("COMMIT");

    const result = await pool.query(`
      SELECT id, name, project_date
      FROM projects
      ORDER BY project_date ASC;
    `);

    console.log("Database update successful.");
    console.table(result.rows);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Database update failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

updateProjectDates();
