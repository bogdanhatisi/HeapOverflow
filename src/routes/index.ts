import express, { Request, Response } from "express";
import userRoutes from "./userRoutes";
import questionRoutes from "./questionRoutes";
import prisma from "../config/prisma";
import redisClient from "../config/redis";
import voteRoutes from "./voteRoutes";

const router = express.Router();

// Route to test database connection and fetch users
router.get("/test-db", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

// Route to test Redis connection
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

// Use user routes
router.use("/users", userRoutes);

// Use question routes
router.use("/questions", questionRoutes);

// Use vote routes
router.use("/votes", voteRoutes);

export default router;
