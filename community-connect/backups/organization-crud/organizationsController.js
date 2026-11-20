import {
  getAllOrganizations,
  getOrganizationById,
  getProjectsByOrganizationId
} from "../models/organizations.js";

// Display all organizations
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

// Display one organization and its projects
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
