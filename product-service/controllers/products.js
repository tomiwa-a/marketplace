const asyncWrapper = require("../middleware/async");
const utils = require("../utils/utils");

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    getProductController = asyncWrapper(async (req, res) => {
        const { productId } = req.params;

        try {
            const product = await this.productService.getProduct(productId);

            res.status(200).json({
                message: "Product found",
                product: product,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    });

    listProductsController = asyncWrapper(async (req, res) => {
        
        const products = await this.productService.listProducts();
        res.status(200).json({
            message: "Products found",
            products: products,
        });
    });

    addProductController = asyncWrapper(async (req, res) => {
        const input = { ...req.body };
        input.userId = utils.getHeaderUserId(req);

        try {
            const result = await this.productService.addProduct(input);
            res.status(201).json({
                message: "Product added successfully",
                product: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: "Error adding product",
                error: error.message,
            });
        }
    });

    deleteProductController = asyncWrapper(async (req, res) => {
        const { productId } = req.params;

        try {
            await this.productService.deleteProduct(productId);
            return res.status(200).json({
                message: "Product deleted successfully",
            });
        } catch (error) {
            return res.status(400).json({
                error: error.message,
            });
        }
    });

    updateProductController = asyncWrapper(async (req, res) => {
        const { productId } = req.params;
        const updates = { ...req.body };

        try {
            const updatedProduct = await this.productService.updateProduct(productId, updates);
            res.status(200).json({
                message: "Product updated successfully",
                product: updatedProduct,
            });
        } catch (error) {
            return res.status(400).json({
                message: "Error updating product",
                error: error.message,
            });
        }
    });

    listUserProductsController = asyncWrapper(async (req, res) => {
        const { userId } = req.params;
        const filters = {
            sort: req.query.sort || "-date",
            q: req.query.q || "",
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            category: req.query.category || "",
            type: req.query.type || "",
            priceFrom: req.query.priceFrom || "",
            priceTo: req.query.priceTo || "",
            status: ["active"]
        };

        let base = "/user/"

        const formattedUrl = req.originalUrl.slice(base.length);

        try {
            const { products, metadata, user } = await this.productService.listUserProducts(userId, filters, formattedUrl);
            res.status(200).json({
                message: "Products found",
                user: user,
                products: products,
                metadata: metadata,
            });
        } catch (error) {
            return res.status(400).json({
                error: error.message,
            });
        }
    });
}

module.exports = ProductController;
