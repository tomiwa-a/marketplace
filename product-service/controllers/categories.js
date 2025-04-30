const asyncWrapper = require("../middleware/async");

const Category = require("../models/categories");

const { validateCategory, validateCategoryType } = require("../data/category");
const { validateObjectId, ValidationError } = require("../utils/validation");

const getAllCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.find();

  return res.json({
    categories: categories,
  });
});

const addCategory = asyncWrapper(async (req, res) => {
  const input = { ...req.body };

  const { error, value } = validateCategory(input);

  if (error) {
    console.log(error);
    return res.status(403).json({
      message: "Validation error",
      error: error.details[0].message,
    });
  }

  const category = Category(value);

  try {
    const result = await category.save();
    res.status(201).json({
      message: "Category added successfully",
      category: result,
    });
  } catch (error) {
    if (error.errorResponse.code == 11000) {
      return res.status(400).json({
        error: "Error adding duplicate category",
      });
    }
    return res.status(400).json({
      message: "Error adding category",
      error: error,
    });
  }
});

const addTypeToCategory = asyncWrapper(async (req, res) => {
  const { categoryId } = req.params;

  try {
    validateObjectId(categoryId);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(400).json({
      error: "Category with id not found",
    });
  }

  const input = { ...req.body };

  let { error, value } = validateCategoryType(input);

  if (error) {
    console.log(error);
    return res.status(403).json({
      message: "Validation error",
      error: error.details[0].message,
    });
  }

  if (category.types.includes(input.type)) {
    return res.status(400).json({ error: "category already has this type" });
  }

  category.types.push(input.type);

  try {
    await category.save();
    return res.status(200).json({
      message: "Type added to category successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
  }

  return res.send("hello");
});

const deleteCategory = asyncWrapper(async (req, res) => {});

module.exports = {
  getAllCategories,
  addCategory,
  deleteCategory,
  addTypeToCategory,
};
