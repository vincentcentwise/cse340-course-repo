import {
  body,
  validationResult
} from "express-validator";

import {
  getAllCategories,
  getCategoryById,
  getProjectsByCategoryId,
  createCategory,
  updateCategory
} from "../models/categories.js";

// Shared server-side validation rules.
export const categoryValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage("Category name must be between 3 and 100 characters.")
];

// Display all categories.
export async function buildCategories(req, res, next) {
  try {
    const categories = await getAllCategories();

    res.render("categories", {
      title: "Categories | Community Connect",
      categories
    });
  } catch (error) {
    next(error);
  }
}

// Display one category and its projects.
export async function buildCategoryDetail(req, res, next) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return res.status(404).render("404", {
        title: "Page Not Found | Community Connect"
      });
    }

    const category = await getCategoryById(categoryId);

    if (!category) {
      return res.status(404).render("404", {
        title: "Category Not Found | Community Connect"
      });
    }

    const projects = await getProjectsByCategoryId(categoryId);

    res.render("category", {
      title: `${category.name} | Community Connect`,
      category,
      projects
    });
  } catch (error) {
    next(error);
  }
}

// Display the new category form.
export function buildNewCategory(req, res) {
  res.render("category-form", {
    title: "Add Category | Community Connect",
    heading: "Create a New Category",
    buttonText: "Create Category",
    formAction: "/new-category",
    category: { name: "" },
    errors: []
  });
}

// Process a new category submission.
export async function createCategoryHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("category-form", {
      title: "Add Category | Community Connect",
      heading: "Create a New Category",
      buttonText: "Create Category",
      formAction: "/new-category",
      category: { name: req.body.name || "" },
      errors: errors.array()
    });
  }

  try {
    const category = await createCategory(req.body.name);

    req.flash("success", `Category "${category.name}" was created successfully.`);
    return res.redirect("/categories");
  } catch (error) {
    if (error.code === "CATEGORY_DUPLICATE" || error.code === "23505") {
      return res.status(409).render("category-form", {
        title: "Add Category | Community Connect",
        heading: "Create a New Category",
        buttonText: "Create Category",
        formAction: "/new-category",
        category: { name: req.body.name || "" },
        errors: [{ msg: "A category with this name already exists." }]
      });
    }

    next(error);
  }
}

// Display the edit category form.
export async function buildEditCategory(req, res, next) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return res.status(404).render("404", {
        title: "Page Not Found | Community Connect"
      });
    }

    const category = await getCategoryById(categoryId);

    if (!category) {
      return res.status(404).render("404", {
        title: "Category Not Found | Community Connect"
      });
    }

    res.render("category-form", {
      title: "Edit Category | Community Connect",
      heading: "Edit Category",
      buttonText: "Save Changes",
      formAction: `/edit-category/${category.id}`,
      category,
      errors: []
    });
  } catch (error) {
    next(error);
  }
}

// Process an edit category submission.
export async function editCategoryHandler(req, res, next) {
  const errors = validationResult(req);

  const categoryId = Number(req.params.id);

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return res.status(404).render("404", {
      title: "Page Not Found | Community Connect"
    });
  }

  try {
    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).render("404", {
        title: "Category Not Found | Community Connect"
      });
    }

    if (!errors.isEmpty()) {
      return res.status(400).render("category-form", {
        title: "Edit Category | Community Connect",
        heading: "Edit Category",
        buttonText: "Save Changes",
        formAction: `/edit-category/${categoryId}`,
        category: {
          ...existingCategory,
          name: req.body.name || ""
        },
        errors: errors.array()
      });
    }

    const updatedCategory = await updateCategory(
      categoryId,
      req.body.name
    );

    if (!updatedCategory) {
      return res.status(404).render("404", {
        title: "Category Not Found | Community Connect"
      });
    }

    req.flash(
      "success",
      `Category "${updatedCategory.name}" was updated successfully.`
    );

    return res.redirect("/categories");
  } catch (error) {
    if (error.code === "CATEGORY_DUPLICATE" || error.code === "23505") {
      return res.status(409).render("category-form", {
        title: "Edit Category | Community Connect",
        heading: "Edit Category",
        buttonText: "Save Changes",
        formAction: `/edit-category/${categoryId}`,
        category: {
          name: req.body.name || ""
        },
        errors: [{ msg: "Another category already uses this name." }]
      });
    }

    next(error);
  }
}
