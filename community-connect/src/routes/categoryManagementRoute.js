import express from "express";

import {
  buildNewCategory,
  createCategoryHandler,
  buildEditCategory,
  editCategoryHandler,
  categoryValidationRules
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/new-category", buildNewCategory);
router.post("/new-category", categoryValidationRules, createCategoryHandler);

router.get("/edit-category/:id", buildEditCategory);
router.post("/edit-category/:id", categoryValidationRules, editCategoryHandler);

export default router;
