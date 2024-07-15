import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

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
