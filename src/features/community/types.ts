export interface CommunityAuthor {
  name: string;
}

export interface QuestionDTO {
  id: string;
  title: string;
  body: string;
  category: string;
  resolved: boolean;
  author: CommunityAuthor;
  commentCount: number;
  isAuthor: boolean;
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  body: string;
  author: CommunityAuthor;
  isAuthor: boolean;
  createdAt: string;
}

export interface QuestionDetailDTO extends QuestionDTO {
  comments: CommentDTO[];
}
