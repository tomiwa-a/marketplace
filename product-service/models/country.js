const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const countrySchema = new Schema({
    name : {
        type: String,
        required: true
    },
    abbreviation: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    strictPopulate: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

countrySchema.virtual('states', {
    ref: 'State',
    localField: '_id',
    foreignField: 'countryId'
});

const Country = mongoose.model("Countries", countrySchema)

module.exports = Country