import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PORT:", process.env.REDIS_PORT);

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("Prisma connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to Prisma:", err);
  });

export default prisma;
