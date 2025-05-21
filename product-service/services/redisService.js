const Redis = require("ioredis");

require("dotenv").config();

class RedisService {
  EXPIRATION_SHORT = 60 * 2; // 2 minutes
  EXPIRATION_MEDIUM = 60 * 30; // 30 minutes
  EXPIRATION_LONG = 60 * 60 * 24; // 24 hours

  constructor() {
    
    this.redis = new Redis({
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || "127.0.0.1",
      username: process.env.REDIS_USER || "default",
      password: process.env.REDIS_PASS || "",
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return 500; // Retry after 500ms
      },
      connectTimeout: 1000, // 1 second timeout
    }, );
  }

  async get(key) {
    try {
      const result = await this.redis.get(key);
      return result;
    } catch {
      throw new Error("Error fetching key");
    }
  }

  async set(key, value, exp) {
    try {
      await this.redis.set(key, value, "EX", exp);
    } catch {
      throw new Error("Error setting key");
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
    } catch {
      throw new Error("Error deleting key");
    }
  }
}

module.exports = RedisService;
