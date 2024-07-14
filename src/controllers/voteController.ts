import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import redisClient from "../config/redis";

export const upvotePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.body;

    if (!req.user) {
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
        user_id: parseInt(req.user.userId),
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
            vote_type_id: 1, // Assuming 1 is the voteTypeId for "Upvote"
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
          vote_type_id: 1, // Assuming 1 is the voteTypeId for "Upvote"
          user_id: parseInt(req.user.userId),
          created_date: new Date(),
        },
      });
      res.status(201).json(newVote);
    }

    // Invalidate cache for the post
    const cacheKey = `post-${postId}`;
    await redisClient.del(cacheKey);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const downvotePost = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { postId } = req.body;

    if (!req.user) {
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
        user_id: parseInt(req.user.userId),
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
            vote_type_id: 2, // Assuming 2 is the voteTypeId for "Downvote"
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
          vote_type_id: 2, // Assuming 2 is the voteTypeId for "Downvote"
          user_id: parseInt(req.user.userId),
          created_date: new Date(),
        },
      });
      res.status(201).json(newVote);
    }

    // Invalidate cache for the post
    const cacheKey = `post-${postId}`;
    await redisClient.del(cacheKey);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};
