const Product = require('../models/product');
const Category = require('../models/categories');
class MongoProductRepository {
    async findById(id) {
        return await Product.findById(id);
    }

    async findAll() {
        return await Product.find();
    }

    async create(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async update(id, updates) {
        return await Product.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );
    }

    async delete(id) {
        return await Product.findByIdAndUpdate(
            id,
            { status: "deleted" },
            { new: true }
        );
    }

    async findByUserId(userId, filters) {
        const {
            sort = "-date",
            q = "",
            page = 1,
            limit = 20,
            category = "",
            type = "",
            priceFrom = "",
            priceTo = ""
        } = filters;

        const query = Product.find({ userId })
            .where(
                q
                    ? {
                        $or: [
                            { name: { $regex: q, $options: "i" } },
                            { description: { $regex: q, $options: "i" } },
                        ],
                    }
                    : {}
            )
            .where(
                category || type
                    ? {
                        $and: [
                            ...(category ? [{ category: category }] : []),
                            ...(type ? [{ type: type }] : []),
                        ],
                    }
                    : {}
            )
            .where(
                priceFrom || priceTo
                    ? {
                        $and: [
                            ...(priceFrom ? [{ price: { $gte: priceFrom } }] : []),
                            ...(priceTo ? [{ price: { $lte: priceTo } }] : []),
                        ],
                    }
                    : {}
            )
            // .where({
            //     status: {
            //         $eq: "active",
            //     },
            // });

        const totalRecords = await query.clone().countDocuments();

        const products = await query
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sort)
            .exec();

        return { products, totalRecords };
    }

    async verifyCategory(category, type) {
        const categoryData = await Category.findOne({
            name: category,
            types: {
                $all: [type],
            },
        });

        if (!categoryData) {
            throw new Error("Invalid category or type");
        }

        return categoryData;
    }
}

module.exports = MongoProductRepository;