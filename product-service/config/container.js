const config = require('./container.config');

class Container {
    constructor() {
        this.instances = {};
    }

    get(path) {
        if (this.instances[path]) {
            return this.instances[path];
        }

        const [type, name] = path.split('.');
        const definition = config[type][name];

        const dependencies = definition.dependencies.map(dep => this.get(dep));
        const instance = new definition.class(...dependencies);

        this.instances[path] = instance;
        return instance;
    }

    getProductController() {
        return this.get('controllers.product');
    }
}

module.exports = new Container();