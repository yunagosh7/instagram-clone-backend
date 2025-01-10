import { Request, Response } from "express";
import articleModel from "../Models/articleModel";
import commentModel from "../Models/commentModel";
import User from "../Models/userModel";


const createArticle = async (req: Request, res: Response) => {
  req.body.user = req.user?._id;
  const newArticle = new articleModel(req.body);
  try {
    await newArticle.save();
    res.status(200).send({
      status: "success",
      message: "article has been created",
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const updateArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (req.user._id === article.user.toString()) {
      await Article.updateOne({ $set: req.body });
      res.status(200).send({
        status: "success",
        message: "article has been updated",
      });
    } else {
      res.status(401).send({
        status: "failure",
        message: "you are not authorized",
      });
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (req.user._id === article.user.toString() || req.user.role === "admin") {
      await commentModel.deleteMany({ user: req.user._id });
      await Article.findByIdAndDelete(req.params.id);
      res.status(200).send({
        status: "success",
        message: "article has been deleted",
      });
    } else {
      res.status(401).send({
        status: "failure",
        message: "you are not authorized",
      });
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getTimeline = async (req: Request, res: Response) => {
  try {
    const userid = req.user._id;
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 1;
    const user = await User.findById(userid).select("followings");
    const myArticles = await Article.find({ user: userid })
      .skip(page * limit)
      .limit(limit)
      .sort({ createdAt: "desc" })
      .populate("user", "username profilePicture");
    const followingsArticles = await Promise.all(
      user.followings.map((followingId) => {
        return Article.find({
          user: followingId,
          createdAt: {
            $gte: new Date(new Date().getTime() - 86400000).toISOString(),
          },
        })
          .skip(page * limit)
          .limit(limit)
          .sort({ createdAt: "desc" })
          .populate("user", "username profilePicture");
      })
    );
    let arr = myArticles.concat(...followingsArticles);
    res.status(200).send({
      status: "success",
      Articles: arr,
      limit: arr.length,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getArticlesUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const articles = await Article.find({ user: user._id });
    res.status(200).json(articles);
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findOne({ _id: req.params.id }).populate(
      "comment"
    );
    res.status(200).json(article);
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const likeUnlike = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article.likes.includes(req.user._id)) {
      await article.updateOne({ $push: { likes: req.user._id } });
      res.status(200).send({
        status: "success",
        message: "the article has been liked",
      });
    } else {
      await article.updateOne({ $pull: { likes: req.user._id } });
      res.status(200).send({
        status: "success",
        message: "the article has been disliked",
      });
    }
  } catch (er) {
    res.status(500).send({
      status: "failure",
      message: er.message,
    });
  }
};
module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  getTimeline,
  getArticlesUser,
  getArticle,
  likeUnlike,
};
