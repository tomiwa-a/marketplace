const { validateProduct } = require("../data/validation");
const { validateObjectId } = require("../utils/validation");
const { calculateMetaData } = require("../utils/utils");
const { validate } = require("uuid");

class ProductService {
  constructor(productRepository, redisService, loggerService) {
    this.productRepository = productRepository;
    this.redisService = redisService;
    this.logger = loggerService;
  }

  async #getProductKey(productId) {
    return `product:${productId}`;
  }

  async getProduct(productId) {
    validateObjectId(productId);

    // this.logger.info("hllo worl");

    const productKey = await this.#getProductKey(productId);
    try {
      let product = await this.redisService.get(productKey);
      if (product) {
        return JSON.parse(product);
      }
    } catch (error) {
      this.logger.error("Redis error in getProduct: ", error);
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    try {
      await this.redisService.set(productKey, JSON.stringify(product), this.redisService.EXPIRATION_MEDIUM);
    } catch (error) {
      this.logger.error('Redis error in getProduct:', error);
    }
    return product;
  }

  async addProduct(productData) {
    const { error, value } = validateProduct(productData);
    if (error) {
      throw new Error(error.details[0].message);
    }

    await this.productRepository.verifyCategory(value.category, value.type);
    let product = await this.productRepository.create(value);

    try {
      const productKey = await this.#getProductKey(product.id);
      await this.redisService.set(productKey, JSON.stringify(product), this.redisService.EXPIRATION_MEDIUM);
    } catch (error) {
      this.logger.error('Redis error in addProduct:', error);
    }

    return product;
  }

  async listUserProducts(userId, filters, formattedUrl) {
    if (!validate(userId)) {
      throw new Error("Invalid user id");
    }

    const SAFE_SORT_LIST = ["price", "date", "-price", "-date"];
    if (!SAFE_SORT_LIST.includes(filters.sort)) {
      throw new Error("Invalid sort field");
    }

    let productsData;
    let totalRecords = 0;

    try {
      const productsKey = await this.#getProductKey(formattedUrl);
      productsData = await this.redisService.get(productsKey);
      if (productsData) {
        productsData = JSON.parse(productsData);
        totalRecords = productsData.length;
        return { 
          products: productsData, 
          metadata: calculateMetaData(totalRecords, filters.page, filters.limit) 
        };
      }
    } catch (error) {
      this.logger.error('Redis error in listUserProducts:', error);
    }

    let products = await this.productRepository.findByUserId(userId, filters);
    productsData = products.products;
    totalRecords = products.totalRecords;

    if (totalRecords !== 0) {
      try {
        const productsKey = await this.#getProductKey(formattedUrl);
        await this.redisService.set(
          productsKey,
          JSON.stringify(productsData),
          this.redisService.EXPIRATION_SHORT
        );
      } catch (error) {
        this.logger.error('Redis error in listUserProducts:', error);
      }
    }

    const metadata = calculateMetaData(
      totalRecords,
      filters.page,
      filters.limit
    );

    return { products: productsData, metadata };
  }

  async listProducts(){
    
  }
}

module.exports = ProductService;
