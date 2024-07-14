export type PopularDayResult = {
  day: string;
  count: number;
};

export type AverageMetricsResult = {
  average_votes: number;
  average_questions: number;
  average_answers: number;
};

export type TotalMetricsResult = {
  total_questions: number;
  total_answers: number;
  total_votes: number;
};

export type PostWithVotesAndChildren = {
  created_date: Date;
  post_type_id: number;
  created_by_user_id: number;
  votes: { id: number; vote_type_id: number }[];
  children: { id: number; post_type_id: number }[];
};

export type DayCounts = {
  [key: string]: number;
};

export type UserMetrics = {
  [key: number]: { votes: number; questions: number; answers: number };
};
