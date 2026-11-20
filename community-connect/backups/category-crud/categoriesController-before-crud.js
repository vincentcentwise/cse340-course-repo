import {
  getAllCategories,
  getCategoryById,
  getProjectsByCategoryId
} from "../models/categories.js";

// Display all categories
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

// Display one category and its projects
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
