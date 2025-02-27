const asyncWrapper = require("../middleware/async")
const Product = require("../models/product")
const { validateObjectId, ValidationError } = require("../utils/validation")
const {calculateMetaData} = require("../utils/utils")
const { validateProduct } = require("../data/validation")

const SAFE_SORT_LIST = ["price", "date", "-price", "-date"]

const getProductController = asyncWrapper(async(req, res) =>{
    const {productId} = req.params

    try {
        validateObjectId(productId)
    } catch (error) {
        return res.status(400).json({
            "message": error.message
        })
    }

    const product = await Product.findById(productId)
    if(!product){
        return res.status(404).json({
            "message": "Product not found"
        })
    }
    res.status(200).json({
        "message": "Product found",
        "product": product
    })
})

//Show All Products
const listProductsController = asyncWrapper(async(req, res)=>{

    const products = await Product.find()
    res.status(200).json({
        "message": "Products found",
        "products": products
    })
})

// Add Product
const addProductController = asyncWrapper(async(req, res)=>{

    const input = {...req.body}
    input.userId = "1"

    const { error, value } = validateProduct(input)
    
    if (error) {
        return res.status(403).json({
            "message": "Validation error",
            "error": error.details[0].message
        })
    }

    const product = new Product(value)

    try{
        const result = await product.save()
        res.status(201).json({
            "message": "Product added successfully", 
            "product": result
        })
    }catch(error){
        return res.status(400).json({
            "message": "Error adding product",
            "error": error
        })
    }
})

// Delete product
const deleteProductController = asyncWrapper(async(req, res)=>{

    //check if it is user / admin.

    //deleting the product updates the status to deleted.
    const {productId } = req.params

    try {
        validateObjectId(productId)
    } catch (error) {
        return res.status(400).json({
            "error": error.message
        })
    }

    const product = await Product.findByIdAndUpdate(productId, {status: "disabled"}, {new:true})

    if(!product){
        return res.status(404).json({
            "error": "Product not found"
        })
    }

    return res.status(200).json({
        message: "Product deleted successfully",
    })


})

// Update product 
const updateProductController = asyncWrapper(async(req, res)=>{    
    const {productId} = req.params
    const updates = {...req.body}

    try {
        validateObjectId(productId)
    } catch (error) {
        return res.status(400).json({
            "message": error.message
        })
    }

    const product = await Product.findById(productId)
    if(!product){
        return res.status(404).json({
            "message": "Product not found"
        })
    }

    // Merge existing product data with updates
    const input = {
        ...product.toObject(),
        ...updates
    }

    // Validate the merged data
    const { error, value } = validateProduct(input)
    
    if (error) {
        return res.status(403).json({
            "message": "Validation error",
            "error": error.details[0].message
        })
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true, runValidators: true }
        )

        res.status(200).json({
            "message": "Product updated successfully",
            "product": updatedProduct
        })
    } catch (error) {
        return res.status(400).json({
            "message": "Error updating product",
            "error": error.message
        })
    }
})

//List user's products 
const listUserProductsController = asyncWrapper(async(req, res)=>{

    const {userId} = req.params

    //get the ID FROM headerv(X-USER-ID) & check if it's the user actually checking. 
    // if it is, it can show pending product also.

    //if i am admin i can view active & deleted, unless stated otherwise by status.

    const {
        sort = "-date", 
        q = "", 
        page = 1, 
        limit=20, 
        category= "", 
        type="", 
        priceFrom = "", 
        priceTo = ""
    } = req.query


    if(!SAFE_SORT_LIST.includes(sort)) {
        return res.status(400).json({
            "message": "Invalid sort field"
        })
    }

    //sort by price, date 
    //filter by name, description, price

    const query = Product.find({userId: userId})
    .where(q ? {
        $or: [
            {name: {$regex: q, $options: "i"}},
            {description: {$regex: q, $options: "i"}},
        ]
    } : {})
    .where(category || type ? {
        $and: [
            ...category ? [{category: category}] : [],
            ...type ? [{type: type}] : []
        ]
    } : {})
    .where(priceFrom || priceTo ? {
        $and: [
            ...priceFrom ? [{price: {$gte: priceFrom}}] : [],
            ...priceTo ? [{price: {$lte: priceTo}}] : []
        ]
    } : {})
    .where({ 
        status : {
            $eq: "active"
        }
    })

    const totalRecords = await query.clone().countDocuments()

    const products = await query
    .skip((page-1)*limit)
    .limit(limit)
    .sort(sort)
    .exec()

    let metadata = calculateMetaData(totalRecords, page, limit)

    res.status(200).json({
        "message": "Products found",
        "products": products,
        "metadata": metadata
    })
})

module.exports = {
    getProductController,
    listProductsController,
    addProductController,
    deleteProductController,
    updateProductController,
    listUserProductsController
}