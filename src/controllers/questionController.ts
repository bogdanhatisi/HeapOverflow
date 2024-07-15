import { Request, Response } from "express";
import prisma from "../config/prisma";
import { QuestionData } from "../models/questionModel";
import redisClient from "../config/redis";
import { broadcast } from "../utils/websocket";
import { deleteKeysByPattern } from "../utils/redisUtils";

export const postQuestion = async (req: Request, res: Response) => {
  try {
    const { postTitle, postDetails, postTypeId, parentQuestionId } =
      req.body as QuestionData;

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const postType = await prisma.postType.findUnique({
      where: { id: postTypeId },
    });

    if (!postType) {
      return res.status(400).json({ error: "Invalid post type" });
    }

    let parentQuestion: any = null;
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
        created_by_user_id: parseInt((user as any).id),
        created_date: new Date(),
      },
    });

    await redisClient.del(`user-questions:${(user as any).id}`);
    await redisClient.del("basic-stats");
    await deleteKeysByPattern("questions:page*");

    broadcast({ type: "newQuestion", data: question });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const postAnswer = async (req: Request, res: Response) => {
  try {
    const { postDetails, parentQuestionId } = req.body;

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
        created_by_user_id: parseInt((user as any).id),
        created_date: new Date(),
      },
    });

    await redisClient.del(
      `user-questions:${parentQuestion.created_by_user_id}`
    );
    await redisClient.del("basic-stats");
    await deleteKeysByPattern("questions:page*");
    await redisClient.del(`post-${parentQuestionId}`);

    broadcast({ type: "newAnswer", data: answer });

    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const getUserQuestions = async (req: Request, res: Response) => {
  try {
    console.log("AIAE");
    const user = req.user;
    console.log("MERGE", user);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("user", user);
    console.log("USER-ID", (user as any).id);
    const questions = await prisma.post.findMany({
      where: {
        created_by_user_id: parseInt((user as any).id),
        postType: { type_name: "Question" },
      },
      include: {
        children: { where: { post_type_id: 2 } }, // Answers
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

    const sortedQuestions = formattedQuestions.sort(
      (a, b) => b.popularityScore - a.popularityScore
    );

    res.status(200).json(sortedQuestions);
  } catch (err) {
    console.log("ERROR", err);
    console.log("ERROR USER", req.user);
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    console.log("MERGE MA", req.user);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const allQuestions = await prisma.post.findMany({
      where: { postType: { type_name: "Question" } },
      include: {
        children: { where: { post_type_id: 2 } }, // Answers
        votes: true,
      },
    });

    const totalQuestions = allQuestions.length;

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

    const question = await prisma.post.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        children: { where: { post_type_id: 2 } }, // Answers
        votes: true,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

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
