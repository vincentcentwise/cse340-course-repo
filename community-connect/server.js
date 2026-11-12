
import express from "express";
import dotenv from "dotenv";

import { getAllOrganizations } from "./src/models/organizations.js";
import { getAllProjects } from "./src/models/projects.js";
import { getAllCategories } from "./src/models/categories.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home | Community Connect"
  });
});

// Organizations route
app.get("/organizations", async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();

    res.render("organizations", {
      title: "Organizations | Community Connect",
      organizations
    });
  } catch (error) {
    next(error);
  }
});

// Service projects route
app.get("/projects", async (req, res, next) => {
  try {
    const projects = await getAllProjects();

    res.render("projects", {
      title: "Service Projects | Community Connect",
      projects
    });
  } catch (error) {
    next(error);
  }
});

// Categories route
app.get("/categories", async (req, res, next) => {
  try {
    const categories = await getAllCategories();

    res.render("categories", {
      title: "Categories | Community Connect",
      categories
    });
  } catch (error) {
    next(error);
  }
});

// Handle application errors
app.use((error, req, res, next) => {
  console.error("Application error:", error);

  res.status(500).send(
    "Something went wrong while loading this page. Please try again later."
  );
});

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Community Connect is running on port ${PORT}`);
});
