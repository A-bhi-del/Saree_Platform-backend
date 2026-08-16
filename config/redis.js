import { createClient } from "redis";
import { RedisUrl } from "./constans.js";

export const redis = createClient({
    url: RedisUrl,
})

redis.on("error", (error) => {
    console.error("Redis Client Issue", error);
})

export const connectRedis = async () => {
    try {
        if (!redis.isOpen) {
            await redis.connect();
        }
        console.log("Redis connected");
    } catch (err) {
        console.error("Error in connection with Redis", error);
        throw error;
    }
}

