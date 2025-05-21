const { validateObjectId } = require("../utils/validation");

class CategoryService {
  constructor(categoryRepository, redisService, loggerService) {
    this.categoryRepository = categoryRepository;
    this.redisService = redisService;
    this.logger = loggerService;
  }

  async #getCategoryKey(categoryId) {
    return `category:${categoryId}`;
  }

  async listCategories() {
    try {
      let categories = await this.redisService.get('categories:all');
      if (categories) {
        return JSON.parse(categories);
      }
    } catch (error) {
      this.logger.error('Redis error in listCategories:', error);
    }

    const categories = await this.categoryRepository.findAll();

    try {
      await this.redisService.set(
        'categories:all',
        JSON.stringify(categories),
        this.redisService.EXPIRATION_LONG
      );
    } catch (error) {
      this.logger.error('Redis error in listCategories:', error);
    }

    return categories;
  }

  async addCategory(categoryData) {
    const category = await this.categoryRepository.create(categoryData);

    try {
      const categoryKey = await this.#getCategoryKey(category.id);
      await this.redisService.set(
        categoryKey,
        JSON.stringify(category),
        this.redisService.EXPIRATION_MEDIUM
      );
      await this.redisService.del('categories:all');
    } catch (error) {
      this.logger.error('Redis error in addCategory:', error);
    }

    return category;
  }

  async addTypeToCategory(categoryId, typeData) {
    validateObjectId(categoryId);

    const category = await this.categoryRepository.addType(categoryId, typeData.type);
    if (!category) {
      throw new Error('Category not found');
    }

    try {
      const categoryKey = await this.#getCategoryKey(categoryId);
      await this.redisService.set(
        categoryKey,
        JSON.stringify(category),
        this.redisService.EXPIRATION_MEDIUM
      );
      await this.redisService.del('categories:all');
    } catch (error) {
      this.logger.error('Redis error in addTypeToCategory:', error);
    }

    return category;
  }

  async deleteCategory(categoryId) {
    validateObjectId(categoryId);

    const result = await this.categoryRepository.delete(categoryId);
    if (!result) {
      throw new Error('Category not found');
    }

    try {
      const categoryKey = await this.#getCategoryKey(categoryId);
      await this.redisService.del(categoryKey);
      await this.redisService.del('categories:all');
    } catch (error) {
      this.logger.error('Redis error in deleteCategory:', error);
    }

    return result;
  }
}

module.exports = CategoryService;