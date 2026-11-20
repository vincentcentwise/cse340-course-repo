import { body, validationResult } from "express-validator";

import {
  getAllProjects,
  getProjectById,
  getAllOrganizationsForProjects,
  createProject,
  updateProject
} from "../models/projects.js";

import { getCategoriesByProjectId } from "../models/categories.js";

// Validate project form submissions.
export const projectValidationRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Project name is required.")
    .bail()
    .isLength({ min: 3, max: 200 })
    .withMessage("Project name must be between 3 and 200 characters."),

  body("organizationId")
    .notEmpty().withMessage("Please select an organization.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Please select a valid organization."),

  body("image")
    .trim()
    .notEmpty().withMessage("Project image path or URL is required.")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Image path or URL cannot exceed 1000 characters."),

  body("imageAlt")
    .trim()
    .notEmpty().withMessage("Image description is required.")
    .bail()
    .isLength({ max: 500 })
    .withMessage("Image description cannot exceed 500 characters."),

  body("description")
    .trim()
    .notEmpty().withMessage("Project description is required.")
    .bail()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters."),

  body("location")
    .trim()
    .notEmpty().withMessage("Project location is required.")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters."),

  body("activity")
    .trim()
    .notEmpty().withMessage("Project activity is required.")
    .bail()
    .isLength({ max: 5000 })
    .withMessage("Activity cannot exceed 5000 characters."),

  body("projectDate")
    .optional({ values: "falsy" })
    .isISO8601({ strict: true })
    .withMessage("Please enter a valid project date.")
];

// Prepare project form values.
function getFormData(bodyData = {}) {
  return {
    name: bodyData.name || "",
    organizationId: bodyData.organizationId || "",
    image: bodyData.image || "",
    imageAlt: bodyData.imageAlt || "",
    description: bodyData.description || "",
    location: bodyData.location || "",
    activity: bodyData.activity || "",
    projectDate: bodyData.projectDate || ""
  };
}

// Render the shared project form.
async function renderProjectForm(res, options) {
  const organizations = await getAllOrganizationsForProjects();

  return res.status(options.status || 200).render("project-form", {
    title: options.title,
    heading: options.heading,
    buttonText: options.buttonText,
    formAction: options.formAction,
    project: options.project,
    organizations,
    errors: options.errors || []
  });
}

// Display all projects.
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

// Display one project and its categories.
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

// Display the create project form.
export async function buildNewProject(req, res, next) {
  try {
    await renderProjectForm(res, {
      title: "Create Project | Community Connect",
      heading: "Create a New Project",
      buttonText: "Create Project",
      formAction: "/new-project",
      project: getFormData()
    });
  } catch (error) {
    next(error);
  }
}

// Handle project creation.
export async function createProjectHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      return await renderProjectForm(res, {
        status: 400,
        title: "Create Project | Community Connect",
        heading: "Create a New Project",
        buttonText: "Create Project",
        formAction: "/new-project",
        project: getFormData(req.body),
        errors: errors.array()
      });
    } catch (error) {
      return next(error);
    }
  }

  try {
    await createProject(req.body);

    req.flash("success", "Project created successfully.");
    return res.redirect("/projects");
  } catch (error) {
    if (error.code === "PROJECT_DUPLICATE" || error.code === "23505") {
      try {
        return await renderProjectForm(res, {
          status: 400,
          title: "Create Project | Community Connect",
          heading: "Create a New Project",
          buttonText: "Create Project",
          formAction: "/new-project",
          project: getFormData(req.body),
          errors: [{
            msg: error.message || "A project with this name already exists."
          }]
        });
      } catch (renderError) {
        return next(renderError);
      }
    }

    if (error.code === "23503") {
      req.flash("error", "Please select an existing organization.");
      return res.redirect("/new-project");
    }

    next(error);
  }
}

// Display the edit project form.
export async function buildEditProject(req, res, next) {
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

    await renderProjectForm(res, {
      title: `Edit ${project.name} | Community Connect`,
      heading: "Edit Project",
      buttonText: "Update Project",
      formAction: `/edit-project/${projectId}`,
      project
    });
  } catch (error) {
    next(error);
  }
}

// Handle project updates.
export async function editProjectHandler(req, res, next) {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId) || projectId < 1) {
    return res.status(404).render("404", {
      title: "Page Not Found | Community Connect"
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      return await renderProjectForm(res, {
        status: 400,
        title: "Edit Project | Community Connect",
        heading: "Edit Project",
        buttonText: "Update Project",
        formAction: `/edit-project/${projectId}`,
        project: { ...getFormData(req.body), id: projectId },
        errors: errors.array()
      });
    } catch (error) {
      return next(error);
    }
  }

  try {
    const updated = await updateProject(projectId, req.body);

    if (!updated) {
      return res.status(404).render("404", {
        title: "Project Not Found | Community Connect"
      });
    }

    req.flash("success", "Project updated successfully.");
    return res.redirect("/projects");
  } catch (error) {
    if (error.code === "PROJECT_DUPLICATE" || error.code === "23505") {
      try {
        return await renderProjectForm(res, {
          status: 400,
          title: "Edit Project | Community Connect",
          heading: "Edit Project",
          buttonText: "Update Project",
          formAction: `/edit-project/${projectId}`,
          project: { ...getFormData(req.body), id: projectId },
          errors: [{
            msg: error.message || "Another project already uses this name."
          }]
        });
      } catch (renderError) {
        return next(renderError);
      }
    }

    if (error.code === "23503") {
      req.flash("error", "Please select an existing organization.");
      return res.redirect(`/edit-project/${projectId}`);
    }

    next(error);
  }
}