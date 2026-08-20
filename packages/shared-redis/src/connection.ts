import { Redis } from "ioredis";
import type { Redis as RedisClient } from "ioredis";

let redis: RedisClient | null = null;

export const connectRedis = () => {
    if (!redis) {

        const redisUrl = process.env.REDIS_URL ; 

        if(!redisUrl) {
            throw new Error("REDIS_URL is missing") ; 
        }

        redis = new Redis(redisUrl) ; 

        redis.on("error", (err: Error) => {
            console.error("Redis Error:", err);
        });
    }

    return redis;
};

export const getRedis = () => {
    if (!redis) {
        throw new Error("Redis is not connected");
    }

    return redis;
};