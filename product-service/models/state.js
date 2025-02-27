const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const stateSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true
    }
},
{
    timestamps: true,

    strictPopulate: false,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
            return ret;
        }
     },
    toObject: { virtuals: true }
})

// stateSchema.virtual('cities', {
//     ref: 'City',
//     localField: '_id',
//     foreignField: 'stateId'
// });

const State = mongoose.model("State", stateSchema)

module.exports = State