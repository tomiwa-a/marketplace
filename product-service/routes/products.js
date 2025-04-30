const router = require("express").Router();
const container = require("../config/container");
const {
  requireAuthenticatedUser,
  requireActivatedUser,
} = require("../middleware/auth");

const authenticatedUser = [requireAuthenticatedUser, requireActivatedUser];

class ProductRoutes {
  constructor(configContainer) {
    this.configContainer = configContainer;
    this.productController = configContainer.getProductController();
    this.router = require("express").Router();

  }

  setupRoutes() {
    this.router.get("/user/:userId", this.productController.listUserProductsController);
    this.router.get("/", this.productController.listProductsController);
    this.router.get("/:productId", this.productController.getProductController);
    this.router.post("/", authenticatedUser, this.productController.addProductController);
    this.router.patch("/:productId", this.productController.updateProductController);
    this.router.delete(
      "/:productId",
      authenticatedUser,
      this.productController.deleteProductController
    );

    return this.router
  }
}

module.exports = ProductRoutes;
