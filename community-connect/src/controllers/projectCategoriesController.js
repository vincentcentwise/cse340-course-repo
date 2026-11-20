import { getProjectById } from "../models/projects.js";

import {
  getAllCategories,
  getCategoriesByProjectId
} from "../models/categories.js";

import {
  replaceProjectCategories
} from "../models/projectCategories.js";

// Display the category assignment page.
export async function buildProjectCategoryAssignment(req, res, next) {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isSafeInteger(projectId) || projectId < 1) {
      return res.status(404).render("404", {
        title: "Project Not Found | Community Connect"
      });
    }

    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).render("404", {
        title: "Project Not Found | Community Connect"
      });
    }

    const [categories, assignedCategories] = await Promise.all([
      getAllCategories(),
      getCategoriesByProjectId(projectId)
    ]);

    const selectedCategoryIds = assignedCategories.map(
      category => Number(category.id)
    );

    return res.render("assign-project-categories", {
      title: `Assign Categories | ${project.name}`,
      project,
      categories,
      selectedCategoryIds
    });
  } catch (error) {
    next(error);
  }
}

// Save the selected project categories.
export async function saveProjectCategoryAssignment(req, res, next) {
  const projectId = Number(req.params.id);

  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    return res.status(404).render("404", {
      title: "Project Not Found | Community Connect"
    });
  }

  const rawCategoryIds = req.body.categoryIds;

  const categoryIds = rawCategoryIds === undefined
    ? []
    : Array.isArray(rawCategoryIds)
      ? rawCategoryIds
      : [rawCategoryIds];

  try {
    await replaceProjectCategories(projectId, categoryIds);

    req.flash(
      "success",
      "Project categories updated successfully."
    );

    return res.redirect(`/project/${projectId}`);
  } catch (error) {
    if (error.code === "PROJECT_NOT_FOUND") {
      return res.status(404).render("404", {
        title: "Project Not Found | Community Connect"
      });
    }

    if (
      error.code === "INVALID_PROJECT_ID" ||
      error.code === "INVALID_CATEGORY_IDS"
    ) {
      req.flash(
        "error",
        "One or more category selections are invalid. Please try again."
      );

      return res.redirect(`/assign-categories/${projectId}`);
    }

    next(error);
  }
}