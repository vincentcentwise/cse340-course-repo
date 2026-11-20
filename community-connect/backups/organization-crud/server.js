import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import flash from "connect-flash";

import categoriesRoute from "./src/routes/categoriesRoute.js";
import categoryManagementRoute from "./src/routes/categoryManagementRoute.js";
import organizationsRoute from "./src/routes/organizationsRoute.js";
import projectsRoute from "./src/routes/projectsRoute.js";

// Load environment variables.
dotenv.config();

// Initialize Express.
const app = express();

// Configure EJS.
app.set("view engine", "ejs");
app.set("views", "./views");

// Parse HTML form submissions.
app.use(express.urlencoded({ extended: false }));

// Serve static files.
app.use(express.static("public"));

// Configure sessions.
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from the environment.");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60
    }
  })
);

// Enable flash messages.
app.use(flash());

// Make flash messages available to every EJS view.
app.use((req, res, next) => {
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  res.locals.validationMessages = req.flash("validation");
  next();
});

// Home route.
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home | Community Connect"
  });
});

// MVC listing routes.
app.use("/", categoryManagementRoute);
app.use("/categories", categoriesRoute);
app.use("/organizations", organizationsRoute);
app.use("/projects", projectsRoute);

// MVC detail routes.
app.use("/category", categoriesRoute);
app.use("/organization", organizationsRoute);
app.use("/project", projectsRoute);

// Handle unmatched routes (404).
app.use((req, res) => {
  res.status(404).render("404", {
    title: "Page Not Found | Community Connect"
  });
});

// Handle application errors (500).
app.use((error, req, res, next) => {
  console.error("Application error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).render("500", {
    title: "Server Error | Community Connect"
  });
});

// Start the server.
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Community Connect is running on port ${PORT}`);
});

