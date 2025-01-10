import { Request, Response } from "express";
import articleModel from "../Models/articleModel";


const addComment = async (req: Request, res: Response) => {
  try {
    const { articleId, ...comment } = req.body;
    comment.user = req.user._id;
    const savedcomment = await articleModel.create(comment)
    await articleModel.findOneAndUpdate(
      { _id: articleId },
      { $push: { comment: savedcomment._id } }
    );
    res.status(200).send({
      status: "success",
      message: "Comment has been created",
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getbyPostId = async (req: Request, res: Response) => {
  const ArticleId = req.params.articleId;
  try {
    const article = await articleModel.findOne({ _id: ArticleId }).populate(
      "comment"
    );
    res.status(200).send({
      status: "success",
      comments: article.comment,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

export const commentController = { addComment, getbyPostId };
