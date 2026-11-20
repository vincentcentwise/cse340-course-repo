import express from "express";

import {
    buildNewProject,
    createProjectHandler,
    buildEditProject,
    editProjectHandler,
    projectValidationRules
} from "../controllers/projectsController.js";

const router = express.Router();

// Create project
router.get("/new-project", buildNewProject);
router.post(
    "/new-project",
    projectValidationRules,
    createProjectHandler
);

// Edit project
router.get("/edit-project/:id", buildEditProject);
router.post(
    "/edit-project/:id",
    projectValidationRules,
    editProjectHandler
);

export default router;