import express from "express";
import dotenv from "dotenv";

import categoriesRoute from "./src/routes/categoriesRoute.js";
import organizationsRoute from "./src/routes/organizationsRoute.js";
import projectsRoute from "./src/routes/projectsRoute.js";

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

// MVC listing routes
app.use("/categories", categoriesRoute);
app.use("/organizations", organizationsRoute);
app.use("/projects", projectsRoute);

// MVC detail routes
app.use("/category", categoriesRoute);
app.use("/organization", organizationsRoute);
app.use("/project", projectsRoute);

// Handle unmatched routes (404)
app.use((req, res) => {
  res.status(404).render("404", {
    title: "Page Not Found | Community Connect"
  });
});

// Handle application errors (500)
app.use((error, req, res, next) => {
  console.error("Application error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).render("500", {
    title: "Server Error | Community Connect"
  });
});

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Community Connect is running on port ${PORT}`);
});
