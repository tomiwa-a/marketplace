const asyncWrapper = require("../middleware/async");
const {validateObjectId} = require("../utils/validation")

const State = require("../models/state");

const addStateController = asyncWrapper(async (req, res) => {

    const { name = "", countryId = "" } = req.body;

    try{
        validateObjectId(countryId);
    }catch(error){
        return res.status(400).json({ error: error.message });
    }

    const state = new State({
        name,
        countryId,
    });

    try{
        const result = await state.save()
        res.status(201).json({
            "message": "State added successfully", 
            "product": result
        })
    }catch(error){
        return res.status(400).json({
            "message": "Error adding State",
            "error": error
        })
    }
});

const listStatesController = asyncWrapper(async (req, res)=>{

    const {countryId} = req.params

    try{
        validateObjectId(countryId);
    }catch(error){
        return res.status(400).json({ error: error.message });
    }
    

    const state = await State.where({countryId})

    return res.status(200).json({
        "message": "States fetched successfully",
        "states": state
    })
})

module.exports = {
    addStateController,
    listStatesController
};