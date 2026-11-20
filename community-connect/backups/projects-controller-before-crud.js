import {
  getAllProjects,
  getProjectById
} from "../models/projects.js";

import { getCategoriesByProjectId } from "../models/categories.js";

// Display all projects
export async function buildProjects(req, res, next) {
  try {
    const projects = await getAllProjects();

    res.render("projects", {
      title: "Service Projects | Community Connect",
      projects
    });
  } catch (error) {
    next(error);
  }
}

// Display one project and its categories
export async function buildProjectDetail(req, res, next) {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(404).render("404", {
        title: "Page Not Found | Community Connect"
      });
    }

    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).render("404", {
        title: "Project Not Found | Community Connect"
      });
    }

    const categories = await getCategoriesByProjectId(projectId);

    res.render("project", {
      title: `${project.name} | Community Connect`,
      project,
      categories
    });
  } catch (error) {
    next(error);
  }
}
