import express, { Request, Response } from "express";
import prisma from "../config/prisma";
import redisClient from "../config/redis";

const router = express.Router();

router.get("/test-db", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

router.get("/test-redis", async (req: Request, res: Response) => {
  try {
    redisClient.set("test", "Hello, Redis!");
    redisClient.get("test", (err, reply) => {
      if (err as Error | null) {
        res.status(500).json({ error: "Redis error" });
      } else {
        res.json({ message: reply });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Redis error" });
  }
});

export default router;
