const ProductRoutes = require("./products")
const CategoryRoutes = require("./categories")
const locations = require("./locations")

class Routes{
    constructor(configContainer, app) {
        this.configContainer = configContainer;
        this.app = app; 
        this.setupRoutes(app);
    }

    setupRoutes(app) {

        const productRoutes = new ProductRoutes(this.configContainer).setupRoutes();
        const categoryRoutes = new CategoryRoutes(this.configContainer).setupRoutes();

        app.use("/categories", categoryRoutes);

        app.use(productRoutes);
        // app.use("/location", locations(this.configContainer));
        // app.use("/categories", categories(this.configContainer));
    }
}

module.exports = Routes;