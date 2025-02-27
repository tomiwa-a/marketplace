const e = require("express");
const mongoose = require("mongoose");

const dbURI = "mongodb://root:root@localhost:27017/marketplace_products?authSource=admin";

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