const redisService = require("../services/redisService");

describe("redis test", ()=>{
    test("redis test", async ()=>{
        const redis = new redisService();
        
        await redis.set("test", "test", 10);
        const result = await redis.get("test");
        expect(result).toBe("test");
    })
})