import express from "express";
import { authenticate } from "../middleware/auth";
import { cache } from "../middleware/cache";
import {
  postQuestion,
  getUserQuestions,
  postAnswer,
  getQuestionData,
} from "../controllers/questionController";

const router = express.Router();

// Route to post a question
router.post("/create-question", authenticate, postQuestion);

// Route to get all questions of the logged-in user
router.get(
  "/user-questions",
  authenticate,
  cache((req) => `user-questions:${(req as any).user?.userId}`), // Cast req to any to access user property
  getUserQuestions
);

// Route to post an answer
router.post("/create-answer", authenticate, postAnswer);

// Route to get detailed question data
router.get(
  "/:questionId",
  authenticate,
  cache((req) => `post-${req.params.questionId}`),
  getQuestionData
);

export default router;
