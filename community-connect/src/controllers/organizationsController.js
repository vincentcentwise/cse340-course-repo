import { body, validationResult } from "express-validator";

import {
  getAllOrganizations,
  getOrganizationById,
  getProjectsByOrganizationId,
  getAllCategories,
  createOrganization,
  updateOrganization
} from "../models/organizations.js";

export const organizationValidationRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Organization name is required.")
    .bail()
    .isLength({ min: 3, max: 200 })
    .withMessage("Organization name must be between 3 and 200 characters."),

  body("categoryId")
    .notEmpty().withMessage("Please select a category.")
    .bail()
    .isInt({ min: 1 }).withMessage("Please select a valid category."),

  body("image")
    .trim()
    .notEmpty().withMessage("Organization image path or URL is required.")
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
    .notEmpty().withMessage("Organization description is required.")
    .bail()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters."),

  body("mission")
    .trim()
    .notEmpty().withMessage("Organization mission is required.")
    .bail()
    .isLength({ max: 5000 })
    .withMessage("Mission cannot exceed 5000 characters.")
];

function getFormData(bodyData = {}) {
  return {
    name: bodyData.name || "",
    categoryId: bodyData.categoryId || "",
    image: bodyData.image || "",
    imageAlt: bodyData.imageAlt || "",
    description: bodyData.description || "",
    mission: bodyData.mission || ""
  };
}

async function renderOrganizationForm(res, options) {
  const categories = await getAllCategories();

  return res.status(options.status || 200).render("organization-form", {
    title: options.title,
    heading: options.heading,
    buttonText: options.buttonText,
    formAction: options.formAction,
    organization: options.organization,
    categories,
    errors: options.errors || []
  });
}

// Display all organizations.
export async function buildOrganizations(req, res, next) {
  try {
    const organizations = await getAllOrganizations();

    res.render("organizations", {
      title: "Organizations | Community Connect",
      organizations
    });
  } catch (error) {
    next(error);
  }
}

// Display one organization and its projects.
export async function buildOrganizationDetail(req, res, next) {
  try {
    const organizationId = Number(req.params.id);

    if (!Number.isInteger(organizationId) || organizationId < 1) {
      return res.status(404).render("404", {
        title: "Page Not Found | Community Connect"
      });
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return res.status(404).render("404", {
        title: "Organization Not Found | Community Connect"
      });
    }

    const projects = await getProjectsByOrganizationId(organizationId);

    res.render("organization", {
      title: `${organization.name} | Community Connect`,
      organization,
      projects
    });
  } catch (error) {
    next(error);
  }
}

// Display the create form.
export async function buildNewOrganization(req, res, next) {
  try {
    await renderOrganizationForm(res, {
      title: "Create Organization | Community Connect",
      heading: "Create a New Organization",
      buttonText: "Create Organization",
      formAction: "/new-organization",
      organization: getFormData()
    });
  } catch (error) {
    next(error);
  }
}

// Handle organization creation.
export async function createOrganizationHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      return await renderOrganizationForm(res, {
        status: 400,
        title: "Create Organization | Community Connect",
        heading: "Create a New Organization",
        buttonText: "Create Organization",
        formAction: "/new-organization",
        organization: getFormData(req.body),
        errors: errors.array()
      });
    } catch (error) {
      return next(error);
    }
  }

  try {
    await createOrganization(req.body);
    req.flash("success", "Organization created successfully.");
    return res.redirect("/organizations");
  } catch (error) {
    if (error.code === "ORGANIZATION_DUPLICATE" || error.code === "23505") {
      try {
        return await renderOrganizationForm(res, {
          status: 400,
          title: "Create Organization | Community Connect",
          heading: "Create a New Organization",
          buttonText: "Create Organization",
          formAction: "/new-organization",
          organization: getFormData(req.body),
          errors: [{ msg: error.message || "An organization with this name already exists." }]
        });
      } catch (renderError) {
        return next(renderError);
      }
    }

    if (error.code === "23503") {
      req.flash("error", "Please select an existing category.");
      return res.redirect("/new-organization");
    }

    next(error);
  }
}

// Display the edit form.
export async function buildEditOrganization(req, res, next) {
  try {
    const organizationId = Number(req.params.id);

    if (!Number.isInteger(organizationId) || organizationId < 1) {
      return res.status(404).render("404", {
        title: "Page Not Found | Community Connect"
      });
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return res.status(404).render("404", {
        title: "Organization Not Found | Community Connect"
      });
    }

    await renderOrganizationForm(res, {
      title: `Edit ${organization.name} | Community Connect`,
      heading: "Edit Organization",
      buttonText: "Update Organization",
      formAction: `/edit-organization/${organizationId}`,
      organization
    });
  } catch (error) {
    next(error);
  }
}

// Handle organization updates.
export async function editOrganizationHandler(req, res, next) {
  const organizationId = Number(req.params.id);

  if (!Number.isInteger(organizationId) || organizationId < 1) {
    return res.status(404).render("404", {
      title: "Page Not Found | Community Connect"
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      return await renderOrganizationForm(res, {
        status: 400,
        title: "Edit Organization | Community Connect",
        heading: "Edit Organization",
        buttonText: "Update Organization",
        formAction: `/edit-organization/${organizationId}`,
        organization: { ...getFormData(req.body), id: organizationId },
        errors: errors.array()
      });
    } catch (error) {
      return next(error);
    }
  }

  try {
    const updated = await updateOrganization(organizationId, req.body);

    if (!updated) {
      return res.status(404).render("404", {
        title: "Organization Not Found | Community Connect"
      });
    }

    req.flash("success", "Organization updated successfully.");
    return res.redirect("/organizations");
  } catch (error) {
    if (error.code === "ORGANIZATION_DUPLICATE" || error.code === "23505") {
      try {
        return await renderOrganizationForm(res, {
          status: 400,
          title: "Edit Organization | Community Connect",
          heading: "Edit Organization",
          buttonText: "Update Organization",
          formAction: `/edit-organization/${organizationId}`,
          organization: { ...getFormData(req.body), id: organizationId },
          errors: [{ msg: error.message || "Another organization already uses this name." }]
        });
      } catch (renderError) {
        return next(renderError);
      }
    }

    if (error.code === "23503") {
      req.flash("error", "Please select an existing category.");
      return res.redirect(`/edit-organization/${organizationId}`);
    }

    next(error);
  }
}
