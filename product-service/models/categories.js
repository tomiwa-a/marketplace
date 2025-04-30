const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const categorySchema = new Schema({

    name : {
        type: String,
        required: true,
        unique: true,
    },


    types: [{
        type: String, 
        
    }]

}, {
    timestamps: true,
})

const Category = mongoose.model("Categories", categorySchema)

module.exports = Category