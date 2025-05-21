const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Products Service API",
    version: "1.0.0",
    description: "This documentation is for the products microservice of the marketplace application.",
  },
};
const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Path to the API routes in your Node.js application
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
