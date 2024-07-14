export interface QuestionData {
  postTitle: string;
  postDetails: string;
  postTypeId: number;
  parentQuestionId?: number | null;
  userId: number;
}
