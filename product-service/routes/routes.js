const ProductRoutes = require("./products")
const locations = require("./locations")
const categories = require("./categories")

class Routes{
    constructor(configContainer, app) {
        this.configContainer = configContainer;
        this.app = app; 
        this.setupRoutes(app);
    }

    setupRoutes(app) {

        const productRoutes = new ProductRoutes(this.configContainer).setupRoutes();
        app.use(productRoutes);
        // app.use("/location", locations(this.configContainer));
        // app.use("/categories", categories(this.configContainer));
    }
}

module.exports = Routes;