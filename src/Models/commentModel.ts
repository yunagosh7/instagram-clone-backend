import mongoose from "mongoose"
import { Comment } from "../interfaces/Comment";

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String, max: 500 },
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);
export default mongoose.model<Comment & mongoose.Document>(
  "Comment",
  CommentSchema,
  "comment"
)