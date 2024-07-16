import express from "express";
import { upvotePost, downvotePost } from "../../controllers/voteController";
import { ensureAuthenticated } from "../../middleware/auth";

const router = express.Router();

// Route to upvote a post
router.post("/upvote", ensureAuthenticated, upvotePost);

// Route to downvote a post
router.post("/downvote", ensureAuthenticated, downvotePost);

export default router;
