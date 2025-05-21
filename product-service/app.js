const express = require("express");
const morgan = require("morgan");

require("dotenv").config();

const Routes = require("./routes/routes");
const errorHandlerMiddleware = require("./middleware/error-handler");
const { setDefaultHeaders } = require("./utils/utils");

const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

class App {
  constructor(configContainer) {
    this.configContainer = configContainer;

    this.setupApp();
  }

  setupApp() {

    const app = express();
    app.use(morgan("dev"));
    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));


    // Uncomment the following line during development to manually set headers
    app.use(setDefaultHeaders);

    const API_PREFIX = process.env.API_PREFIX || "";

    app.use((req, res, next) => {
      if (API_PREFIX && req.originalUrl.startsWith(API_PREFIX)) {
        req.url = req.originalUrl.slice(API_PREFIX.length);
      }
      next();
    });

    // Error handling middleware
    app.use(errorHandlerMiddleware);

    app.get("/welcome", (req, res) => {
      // console.log(req);
    
      res.status(200).json({
        message: "Welcome to the product API",
      });
    });

    new Routes(this.configContainer, app);

    return app;

  }
}

module.exports = App;
