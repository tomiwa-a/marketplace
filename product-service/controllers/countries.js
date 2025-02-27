const asyncWrapper = require("../middleware/async");
const Country = require("../models/country");

const listCountriesController = asyncWrapper(async (req, res) => {
    const { populate } = req.query;

    try {
        let query = Country.find();

        if (populate === 'true') {
            query = query.populate({
                path: 'states',
                model: 'State',
                populate: {
                    path: 'cities',
                    model: 'City'
                }
            });
        }

        const countries = await query.exec();

        res.status(200).json({
            message: "Countries retrieved successfully",
            countries: countries
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving countries",
            error: error.message
        });
    }
});

module.exports = {
    listCountriesController
};