const Category = require('../models/categories');

class MongoCategoryRepository {
    async findAll() {
        return await Category.find();
    }

    async findById(id) {
        return await Category.findById(id);
    }

    async create(categoryData) {
        const category = new Category({
            name: categoryData.name,
            description: categoryData.description,
            types: categoryData.types || [],
            userId: categoryData.userId
        });
        return await category.save();
    }

    async addType(categoryId, type) {
        return await Category.findByIdAndUpdate(
            categoryId,
            { $addToSet: { types: type } },
            { new: true, runValidators: true }
        );
    }

    async delete(id) {
        return await Category.findByIdAndDelete(id);
    }
}

module.exports = MongoCategoryRepository;