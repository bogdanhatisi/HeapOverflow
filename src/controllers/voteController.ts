import { Request, Response } from "express";
import prisma from "../config/prisma";
import redisClient from "../config/redis";
import { broadcast } from "../utils/websocket";
import { deleteKeysByPattern } from "../utils/redisUtils";

export const upvotePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // Check if the user has already voted on this post
    const existingVote = await prisma.vote.findFirst({
      where: {
        post_id: postId,
        user_id: parseInt((user as any).id),
      },
    });

    if (existingVote) {
      if (existingVote.vote_type_id === 1) {
        // If the existing vote is an upvote, delete the vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        res.status(200).json({ message: "Vote removed" });
      } else {
        // Update the existing vote to an upvote
        const updatedVote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: {
            vote_type_id: 1,
            created_date: new Date(),
          },
        });
        res.status(200).json(updatedVote);
      }
    } else {
      // Create a new upvote
      const newVote = await prisma.vote.create({
        data: {
          post_id: postId,
          vote_type_id: 1,
          user_id: parseInt((user as any).id),
          created_date: new Date(),
        },
      });

      // Invalidate basic stats cache and questions cache
      await redisClient.del("basic-stats");
      await deleteKeysByPattern("questions:page*");
      broadcast({ type: "newVote", data: newVote });
      res.status(201).json(newVote);
    }

    // Invalidate cache for the post
    const cacheKey = `post-${postId}`;
    await redisClient.del(cacheKey);

    if (post.parent_question_id) {
      // Invalidate cache for the parent question
      const parentQuestion = await prisma.post.findUnique({
        where: { id: post.parent_question_id },
      });
      if (!parentQuestion) {
        return res.status(400).json({ error: "Parent question not found" });
      }
      const cacheKeyParentQuestion = `user-questions:${parentQuestion.created_by_user_id}`;
      await redisClient.del(cacheKeyParentQuestion);
    } else {
      // Invalidate cache for the user's questions
      const cacheKeyUserQuestions = `user-questions:${post.created_by_user_id}`;
      await redisClient.del(cacheKeyUserQuestions);
    }
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const downvotePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const user = req.user as { userId: string };

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // Check if the user has already voted on this post
    const existingVote = await prisma.vote.findFirst({
      where: {
        post_id: postId,
        user_id: parseInt(user.userId),
      },
    });

    if (existingVote) {
      if (existingVote.vote_type_id === 2) {
        // If the existing vote is a downvote, delete the vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        res.status(200).json({ message: "Vote removed" });
      } else {
        // Update the existing vote to a downvote
        const updatedVote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: {
            vote_type_id: 2,
            created_date: new Date(),
          },
        });
        res.status(200).json(updatedVote);
      }
    } else {
      // Create a new downvote
      const newVote = await prisma.vote.create({
        data: {
          post_id: postId,
          vote_type_id: 2,
          user_id: parseInt(user.userId),
          created_date: new Date(),
        },
      });
      broadcast({ type: "newVote", data: newVote });
      res.status(201).json(newVote);
    }
    // Invalidate cache for the post
    const cacheKey = `post-${postId}`;
    await redisClient.del(cacheKey);

    if (post.parent_question_id) {
      // Invalidate cache for the parent question
      const parentQuestion = await prisma.post.findUnique({
        where: { id: post.parent_question_id },
      });
      if (!parentQuestion) {
        return res.status(400).json({ error: "Parent question not found" });
      }
      const cacheKeyParentQuestion = `user-questions:${parentQuestion.created_by_user_id}`;
      await redisClient.del(cacheKeyParentQuestion);
    } else {
      // Invalidate cache for the user's questions
      const cacheKeyUserQuestions = `user-questions:${post.created_by_user_id}`;
      await redisClient.del(cacheKeyUserQuestions);
    }
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};
