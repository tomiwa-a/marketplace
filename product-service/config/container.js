const config = require('./container.config');

class Container {
    constructor() {
        this.instances = new Map();
        this.resolutionStack = new Set(); // For circular dependency detection
    }

    get(path) {
        if (this.instances.has(path)) {
            return this.instances.get(path);
        }

        // Circular dependency detection
        if (this.resolutionStack.has(path)) {
            throw new Error(`Circular dependency detected while resolving: ${path}`);
        }

        const [type, name] = path.split('.');
        
        // Validate path
        if (!config[type] || !config[type][name]) {
            throw new Error(`No definition found for ${path}`);
        }

        const definition = config[type][name];

        try {
            this.resolutionStack.add(path);
            
            const dependencies = definition.dependencies.map(dep => {
                try {
                    return this.get(dep);
                } catch (error) {
                    throw new Error(`Error resolving dependency ${dep} for ${path}: ${error.message}`);
                }
            });

            const instance = new definition.class(...dependencies);
            this.instances.set(path, instance);
            
            return instance;
        } finally {
            this.resolutionStack.delete(path);
        }
    }

    // Get instance by type
    getByType(type, name) {
        return this.get(`${type}.${name}`);
    }

    // Clear all instances
    clear() {
        this.instances.clear();
        this.resolutionStack.clear();
    }

    // Check if service exists
    has(path) {
        const [type, name] = path.split('.');
        return !!(config[type] && config[type][name]);
    }

    // Get all registered services of a type
    getAllOfType(type) {
        if (!config[type]) return [];
        return Object.keys(config[type]);
    }

    // Convenience methods
    getService(name) { return this.getByType('services', name); }
    getRepository(name) { return this.getByType('repositories', name); }
    getController(name) { return this.getByType('controllers', name); }
}

module.exports = new Container();