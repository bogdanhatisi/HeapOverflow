import express from "express";
import { authenticate } from "../../middleware/auth";
import { upvotePost, downvotePost } from "../../controllers/voteController";

const router = express.Router();

// Route to upvote a post
router.post("/upvote", authenticate, upvotePost);

// Route to downvote a post
router.post("/downvote", authenticate, downvotePost);

export default router;
