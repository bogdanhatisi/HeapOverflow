import express from "express";
import { ensureAuthenticated } from "../../middleware/auth";
import { cache } from "../../middleware/cache";
import {
  postQuestion,
  getUserQuestions,
  postAnswer,
  getQuestionData,
  getAllQuestions,
} from "../../controllers/questionController";

const router = express.Router();

// Route to post a question
router.post("/create-question", ensureAuthenticated, postQuestion);

// Route to get all questions of the logged-in user
router.get(
  "/user-questions",
  ensureAuthenticated,
  cache((req) => `user-questions:${(req as any).user?.id}`),
  getUserQuestions
);

// Route to post an answer
router.post("/create-answer", ensureAuthenticated, postAnswer);

// Route to get detailed question data
router.get(
  "/details/:questionId",
  ensureAuthenticated,
  cache((req) => `post-${req.params.questionId}`),
  getQuestionData
);

// Route to get all questions
router.get(
  "/feed",
  cache(
    (req) =>
      `questions:page=${req.query.page || 1}:pageSize=${
        req.query.pageSize || 10
      }`
  ),
  getAllQuestions
);

export default router;
