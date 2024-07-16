import express from "express";
import {
  authenticateGoogle,
  authenticateGoogleCallback,
} from "../../config/passport";

const router = express.Router();

// Google OAuth 2.0 authentication route
router.get("/google", authenticateGoogle);

router.get("/google/callback", authenticateGoogleCallback);

export default router;
