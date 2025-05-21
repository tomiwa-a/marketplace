/**
 * Interface for cache services
 * @interface
 */

class CacheService{

    #cache;

    constructor(){
        this.#cache = new Map();
    }

    get(key){
        if(this.#cache.has(key)){
            return this.#cache.get(key);
        }
        return null;
    }

    set(key, value, exp){
        this.#cache[key] = value;
        setTimeout(()=>{
            delete cache[key];
        }, exp);
    }

    delete(key) {
        return this.#cache.delete(key);
    }

    clear() {
        this.#cache.clear();
    }

}

module.exports = CacheService;