import {redis} from "../config/redis.js";

export const getCache = async (key) => {
  const data = await redisClient.get(key);

  return data ? JSON.parse(data) : null;
};

export const setCache = async (
  key,
  value,
  ttl = 300
) => {
  await redis.set(
    key,
    JSON.stringify(value),
    {
      EX: ttl,
    }
  );
};

export const deleteCache = async (key) => {
  await redis.del(key);
};