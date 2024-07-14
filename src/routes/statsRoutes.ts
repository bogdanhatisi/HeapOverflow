import express from "express";
import { getStatistics } from "../controllers/statsController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Route to get statistics
router.get("/basic", authenticate, getStatistics);

export default router;
