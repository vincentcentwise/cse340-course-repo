import express from "express";

import {
  buildNewOrganization,
  createOrganizationHandler,
  buildEditOrganization,
  editOrganizationHandler,
  organizationValidationRules
} from "../controllers/organizationsController.js";

const router = express.Router();

router.get("/new-organization", buildNewOrganization);
router.post("/new-organization", organizationValidationRules, createOrganizationHandler);

router.get("/edit-organization/:id", buildEditOrganization);
router.post("/edit-organization/:id", organizationValidationRules, editOrganizationHandler);

export default router;
