const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const citySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    }
}, 
{
timestamps: true
})

const City = mogoose.model("City", citySchema)

module.exports = City