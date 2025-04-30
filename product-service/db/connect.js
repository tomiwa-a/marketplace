const e = require("express");
const mongoose = require("mongoose");
require('dotenv').config()

const dbURI = process.env.PRODUCT_DB_URI;

async function dbConnect() {
    try {
        const connection = await mongoose.connect(dbURI);

        console.log("connected to database")
        return connection;
    } catch (error) {
        console.log("Error connecting to database", error);
    }
}

module.exports = {
    dbConnect
}