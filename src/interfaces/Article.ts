import { User } from "./User";

export interface Article {
  user: User;
  description: string;
  imgurl: String;
  likes: User;
  comment: Comment;
}
