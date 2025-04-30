const { validateProduct } = require('../data/validation');
const { validateObjectId } = require('../utils/validation');
const { calculateMetaData } = require('../utils/utils');

class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async getProduct(productId) {
        validateObjectId(productId);
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async listProducts() {
        return await this.productRepository.findAll();
    }

    async addProduct(productData) {
        const { error, value } = validateProduct(productData);
        if (error) {
            throw new Error(error.details[0].message);
        }

        await this.productRepository.verifyCategory(value.category, value.type);
        return await this.productRepository.create(value);
    }

    async updateProduct(productId, updates) {
        validateObjectId(productId);
        
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const input = {
            ...product.toObject(),
            ...updates
        };

        const { error, value } = validateProduct(input);
        if (error) {
            throw new Error(error.details[0].message);
        }

        return await this.productRepository.update(productId, updates);
    }

    async deleteProduct(productId) {
        validateObjectId(productId);
        
        const product = await this.productRepository.delete(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async listUserProducts(userId, filters) {
        const SAFE_SORT_LIST = ["price", "date", "-price", "-date"];
        if (!SAFE_SORT_LIST.includes(filters.sort)) {
            throw new Error('Invalid sort field');
        }

        const { products, totalRecords } = await this.productRepository.findByUserId(userId, filters);
        const metadata = calculateMetaData(totalRecords, filters.page, filters.limit);

        return { products, metadata };
    }
}

module.exports = ProductService;