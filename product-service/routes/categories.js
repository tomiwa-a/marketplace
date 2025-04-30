const router = require("express").Router()

const {
    addCategory, 
    deleteCategory, 
    getAllCategories,
    addTypeToCategory
} = require("../controllers/categories")

router.get("/", getAllCategories)
router.post("/", addCategory)
router.post("/:categoryId", addTypeToCategory)



module.exports = router