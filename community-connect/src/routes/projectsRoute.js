import express from "express";
import {
  buildProjects,
  buildProjectDetail
} from "../controllers/projectsController.js";

const router = express.Router();

router.get("/", buildProjects);
router.get("/:id", buildProjectDetail);

export default router;
