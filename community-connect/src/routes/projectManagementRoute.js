import express from "express";
import {
    buildProjectCategoryAssignment,
    saveProjectCategoryAssignment
} from "../controllers/projectCategoriesController.js";

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


// Assign categories to a project
router.get("/assign-categories/:id", buildProjectCategoryAssignment);
router.post("/assign-categories/:id", saveProjectCategoryAssignment);
export default router;