const router = require("express").Router();

const {
    addProductController,
    deleteProductController, 
    getProductController, 
    listProductsController, 
    listUserProductsController, 
    updateProductController
} = require("../controllers/products")


router.get("/user/:userId", listUserProductsController)

router.get("/", listProductsController)
router.get("/:productId", getProductController)

router.post("/", addProductController)
router.patch("/:productId", updateProductController)
router.delete("/:productId", deleteProductController)

module.exports = router