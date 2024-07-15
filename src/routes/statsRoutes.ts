import express from "express";
import { getStatistics } from "../controllers/statsController";
import { cache } from "../middleware/cache";
import { authenticateGoogle } from "../config/passport";
import e from "express";
import { ensureAuthenticated } from "../middleware/auth";

const router = express.Router();

// Route to get statistics
router.get(
  "/basic",
  ensureAuthenticated,
  cache((req) => `basic-stats`),
  getStatistics
);

export default router;
