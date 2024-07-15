import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PORT:", process.env.REDIS_PORT);

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});
export default redisClient;
