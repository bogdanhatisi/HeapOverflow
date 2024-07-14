import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { QuestionData } from "../models/questionModel";
import redisClient from "../config/redis";
import { broadcast } from "../utils/websocket";
import { deleteKeysByPattern } from "../utils/redisUtils";

export const postQuestion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { postTitle, postDetails, postTypeId, parentQuestionId } =
      req.body as QuestionData;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate post type
    const postType = await prisma.postType.findUnique({
      where: { id: postTypeId },
    });

    if (!postType) {
      return res.status(400).json({ error: "Invalid post type" });
    }

    // Validate parent question ID if provided
    let parentQuestion = null;
    if (parentQuestionId) {
      parentQuestion = await prisma.post.findUnique({
        where: { id: parentQuestionId },
      });

      if (!parentQuestion) {
        return res.status(400).json({ error: "Invalid parent question ID" });
      }
    }

    const question = await prisma.post.create({
      data: {
        post_title: postTitle,
        post_details: postDetails,
        post_type_id: postTypeId,
        parent_question_id: parentQuestionId || null,
        created_by_user_id: parseInt(req.user.userId),
        created_date: new Date(),
      },
    });

    // Invalidate cache
    const cacheKey = `user-questions:${req.user.userId}`;
    await redisClient.del(cacheKey);

    // Invalidate basic stats cache and questions cache
    await redisClient.del("basic-stats");
    await deleteKeysByPattern("questions:page*");
    broadcast({ type: "newQuestion", data: question });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const postAnswer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postDetails, parentQuestionId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate parent question ID
    const parentQuestion = await prisma.post.findUnique({
      where: { id: parentQuestionId },
    });

    if (!parentQuestion) {
      return res.status(400).json({ error: "Invalid parent question ID" });
    }

    const answer = await prisma.post.create({
      data: {
        post_details: postDetails,
        post_type_id: 2,
        parent_question_id: parentQuestionId,
        created_by_user_id: parseInt(req.user.userId),
        created_date: new Date(),
      },
    });

    // Invalidate cache
    const cacheKey = `user-questions:${parentQuestion.created_by_user_id}`;
    await redisClient.del(cacheKey);

    // Invalidate basic stats cache and questions cache
    await redisClient.del("basic-stats");
    await deleteKeysByPattern("questions:page*");

    const cacheKeyParentQuestion = `post-${parentQuestionId}`;
    await redisClient.del(cacheKeyParentQuestion);
    broadcast({ type: "newAnswer", data: answer });
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const getUserQuestions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch from database
    const questions = await prisma.post.findMany({
      where: {
        created_by_user_id: parseInt(req.user.userId),
        postType: {
          type_name: "Question",
        },
      },
      include: {
        children: {
          where: { post_type_id: 2 }, // Answers
        },
        votes: true,
      },
    });

    const formattedQuestions = questions.map((question) => {
      const upvotes = question.votes.filter(
        (vote) => vote.vote_type_id === 1
      ).length;
      const downvotes = question.votes.filter(
        (vote) => vote.vote_type_id === 2
      ).length;
      const answersCount = question.children.length;
      const popularityScore = upvotes + answersCount - downvotes;

      return {
        id: question.id,
        post_title: question.post_title,
        post_details: question.post_details,
        created_date: question.created_date,
        upvotes,
        downvotes,
        answersCount,
        popularityScore,
      };
    });

    // Sort questions by popularity score in descending order
    const sortedQuestions = formattedQuestions.sort(
      (a, b) => b.popularityScore - a.popularityScore
    );

    res.status(200).json(sortedQuestions);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Fetch all questions from the database without pagination
    const allQuestions = await prisma.post.findMany({
      where: {
        postType: {
          type_name: "Question",
        },
      },
      include: {
        children: {
          where: { post_type_id: 2 }, // Answers
        },
        votes: true,
      },
    });

    const totalQuestions = allQuestions.length;

    // Calculate pagination manually
    const offset = (page - 1) * pageSize;
    const paginatedQuestions = allQuestions.slice(offset, offset + pageSize);

    const formattedQuestions = paginatedQuestions.map((question) => {
      const upvotes = question.votes.filter(
        (vote) => vote.vote_type_id === 1
      ).length;
      const downvotes = question.votes.filter(
        (vote) => vote.vote_type_id === 2
      ).length;
      const answersCount = question.children.length;
      const popularityScore = upvotes + answersCount - downvotes;

      return {
        id: question.id,
        post_title: question.post_title,
        post_details: question.post_details,
        created_date: question.created_date,
        upvotes,
        downvotes,
        answersCount,
        popularityScore,
      };
    });

    // Sort questions by popularity score in descending order
    const sortedQuestions = formattedQuestions.sort(
      (a, b) => b.popularityScore - a.popularityScore
    );

    res.status(200).json({
      totalQuestions,
      totalPages: Math.ceil(totalQuestions / pageSize),
      currentPage: page,
      pageSize,
      questions: sortedQuestions,
    });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const getQuestionData = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    // Fetch from database
    const question = await prisma.post.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        children: {
          where: { post_type_id: 2 }, // Answers
        },
        votes: true,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Calculate upvotes and downvotes
    const upvotes = question.votes.filter(
      (vote) => vote.vote_type_id === 1
    ).length;
    const downvotes = question.votes.filter(
      (vote) => vote.vote_type_id === 2
    ).length;

    const questionData = {
      question,
      answers: question.children,
      upvotes,
      downvotes,
    };

    res.status(200).json(questionData);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};
