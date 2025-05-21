const asyncWrapper = require("../middleware/async");
const utils = require("../utils/utils");

class CategoryController {
  constructor(categoryService, redisService, loggerService) {
    this.categoryService = categoryService;
    this.redisService = redisService;
    this.loggerService = loggerService;
  }

  getAllCategories = asyncWrapper(async (req, res) => {
    try {
      const categories = await this.categoryService.listCategories();
      res.status(200).json({
        message: "Categories found",
        categories: categories
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message
      });
    }
  });

  addCategory = asyncWrapper(async (req, res) => {
    const input = { ...req.body };
    input.userId = utils.getHeaderUserId(req);

    try {
      const result = await this.categoryService.addCategory(input);
      res.status(201).json({
        message: "Category added successfully",
        category: result
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error adding category",
        error: error.message
      });
    }
  });
  
  addTypeToCategory = asyncWrapper(async (req, res) => {
    const { categoryId } = req.params;
    const input = { ...req.body };

    try {
      const result = await this.categoryService.addTypeToCategory(categoryId, input);
      return res.status(200).json({
        message: "Type added to category successfully",
        category: result
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error adding type to category",
        error: error.message
      });
    }
  });
  
  deleteCategory = asyncWrapper(async (req, res) => {
    const { categoryId } = req.params;

    try {
      await this.categoryService.deleteCategory(categoryId);
      return res.status(200).json({
        message: "Category deleted successfully"
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message
      });
    }
  });
  

}

module.exports = CategoryController;