import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("Redis Connected 🚀");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
}); 

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;