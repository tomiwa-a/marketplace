const {listCountriesController} = require("../controllers/countries")
const {
    addStateController,
    listStatesController
} = require("../controllers/states")

const router = require("express").Router()

router.get("/countries", listCountriesController)

router.post("/state", addStateController)

router.get("/countries/:countryId", listStatesController)

module.exports = router