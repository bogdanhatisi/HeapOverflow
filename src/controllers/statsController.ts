import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  AverageMetricsResult,
  DayCounts,
  PopularDayResult,
  PostWithVotesAndChildren,
  TotalMetricsResult,
  UserMetrics,
} from "../models/statsModel";

export const getStatistics = async (req: Request, res: Response) => {
  try {
    // Get all posts
    const posts: PostWithVotesAndChildren[] = await prisma.post.findMany({
      select: {
        created_date: true,
        post_type_id: true,
        created_by_user_id: true,
        votes: {
          select: {
            id: true,
            vote_type_id: true,
          },
        },
        children: {
          select: {
            id: true,
            post_type_id: true,
          },
        },
      },
    });

    // Calculate most popular day of the week
    const dayCounts: DayCounts = posts.reduce((acc: DayCounts, post) => {
      const day = post.created_date.toLocaleString("en-US", {
        weekday: "long",
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const popularDay: PopularDayResult = Object.entries(dayCounts).reduce(
      (acc, [day, count]) => {
        if (count > acc.count) {
          return { day, count };
        }
        return acc;
      },
      { day: "", count: 0 }
    );

    // Calculate average votes, questions, and answers per user
    const userMetrics: UserMetrics = posts.reduce((acc: UserMetrics, post) => {
      const userId = post.created_by_user_id;
      if (!acc[userId]) {
        acc[userId] = { votes: 0, questions: 0, answers: 0 };
      }
      acc[userId].votes += post.votes.length;
      if (post.post_type_id === 1) {
        acc[userId].questions += 1;
      } else if (post.post_type_id === 2) {
        acc[userId].answers += 1;
      }
      return acc;
    }, {});

    const userCount = Object.keys(userMetrics).length;
    const totalMetrics = Object.values(userMetrics).reduce(
      (acc, metrics) => {
        acc.votes += metrics.votes;
        acc.questions += metrics.questions;
        acc.answers += metrics.answers;
        return acc;
      },
      { votes: 0, questions: 0, answers: 0 }
    );

    const averageMetrics: AverageMetricsResult = {
      average_votes: totalMetrics.votes / userCount,
      average_questions: totalMetrics.questions / userCount,
      average_answers: totalMetrics.answers / userCount,
    };

    // Calculate total questions, votes, and answers
    const totalQuestions = posts.filter(
      (post) => post.post_type_id === 1
    ).length;
    const totalAnswers = posts.filter((post) => post.post_type_id === 2).length;
    const totalVotes = totalMetrics.votes;

    const totalMetricsResult: TotalMetricsResult = {
      total_questions: totalQuestions,
      total_answers: totalAnswers,
      total_votes: totalVotes,
    };

    res.status(200).json({
      popularDay,
      averageMetrics,
      totalMetrics: totalMetricsResult,
    });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};
