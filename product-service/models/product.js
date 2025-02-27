const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const STATUS_ENUM = {
    values: ['active', 'pending', 'disabled'],
    message: 'status enum validator failed for path `{PATH}` with value `{VALUE}`'
  }

const productSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    quantity:{
        type: Number, 
        required: true, 
        default: 1
    },
    description:{
        type: String, 
        required: true, 
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String, 
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    media: [{
        name: String, 
        type: String, 
    }],
    location:{
        country: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Country",
            required: true
        },
        state : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },

    },
    status: {
        type: String,
        enum: STATUS_ENUM,
        required: true,
        default: "pending"
    },

},
{
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
}
)

const Product = mongoose.model("Product", productSchema)

module.exports = Product;