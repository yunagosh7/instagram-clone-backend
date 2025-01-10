import { ObjectId } from "mongoose";
import { User } from "./User";

export interface Article {
  user: User;
  description: string;
  imgurl: String;
  likes: ObjectId[]
  comment: Comment;
}
