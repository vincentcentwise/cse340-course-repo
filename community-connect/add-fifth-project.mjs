import { pool } from "./src/database.js";

const client = await pool.connect();

try {
  await client.query("BEGIN");

  // Add or update the fifth project.
  const projectResult = await client.query(`
    INSERT INTO projects (
      name,
      slug,
      organization_id,
      image,
      image_alt,
      description,
      location,
      activity
    )
    SELECT
      'Community Food Drive',
      'community-food-drive',
      o.id,
      '',
      'Community volunteers organizing food donations',
      'Join volunteers in collecting and distributing food supplies to families and individuals in need.',
      'Local community centres',
      'Food collection, sorting, and distribution'
    FROM organizations o
    WHERE o.slug = 'healthy-living-network'
    ON CONFLICT (slug)
    DO UPDATE SET
      name = EXCLUDED.name,
      organization_id = EXCLUDED.organization_id,
      image = EXCLUDED.image,
      image_alt = EXCLUDED.image_alt,
      description = EXCLUDED.description,
      location = EXCLUDED.location,
      activity = EXCLUDED.activity
    RETURNING id, name, slug;
  `);

  if (projectResult.rowCount !== 1) {
    throw new Error("Healthy Living Network was not found. Project was not added.");
  }

  // Assign the project date.
  await client.query(`
    UPDATE projects
    SET project_date = DATE '2026-12-18'
    WHERE slug = 'community-food-drive';
  `);

  // Assign the Community Service category.
  await client.query(`
    INSERT INTO project_categories (project_id, category_id)
    SELECT p.id, c.id
    FROM projects p
    CROSS JOIN categories c
    WHERE p.slug = 'community-food-drive'
      AND c.slug = 'community-service'
    ON CONFLICT DO NOTHING;
  `);

  // Confirm the project and its category.
  const verification = await client.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      TO_CHAR(p.project_date, 'YYYY-MM-DD') AS "projectDate",
      o.name AS "organizationName",
      STRING_AGG(c.name, ', ' ORDER BY c.name) AS categories
    FROM projects p
    INNER JOIN organizations o
      ON p.organization_id = o.id
    LEFT JOIN project_categories pc
      ON p.id = pc.project_id
    LEFT JOIN categories c
      ON pc.category_id = c.id
    WHERE p.slug = 'community-food-drive'
    GROUP BY p.id, o.name;
  `);

  if (verification.rowCount !== 1 ||
      verification.rows[0].categories?.split(", ").includes("Community Service") !== true) {
    throw new Error("Project verification failed.");
  }

  await client.query("COMMIT");

  console.log("SUCCESS: Community Food Drive added to Supabase.");
  console.table(verification.rows);

} catch (error) {
  await client.query("ROLLBACK");
  console.error("UPDATE FAILED. Changes were rolled back.");
  console.error(error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
