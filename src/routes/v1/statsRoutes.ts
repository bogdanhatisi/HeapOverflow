import express from "express";
import { getStatistics } from "../../controllers/statsController";
import { authenticate } from "../../middleware/auth";
import { cache } from "../../middleware/cache";

const router = express.Router();

// Route to get statistics
router.get(
  "/basic",
  authenticate,
  cache((req) => `basic-stats`),
  getStatistics
);

export default router;
