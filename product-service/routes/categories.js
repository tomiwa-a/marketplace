const {
    requireAuthenticatedUser,
    requireActivatedUser,
  } = require("../middleware/auth");
  
  const authenticatedUser = [requireAuthenticatedUser, requireActivatedUser];

class CategoryRoutes {
  constructor(configContainer) {
    this.configContainer = configContainer;
    this.categoryController = configContainer.getController("category");
    this.router = require("express").Router();
  }

  setupRoutes(){

    this.router.get("/", this.categoryController.getAllCategories)
    this.router.post("/", this.categoryController.addCategory)
    this.router.post("/:categoryId", this.categoryController.addTypeToCategory)
    return this.router;
  }
}

module.exports = CategoryRoutes;