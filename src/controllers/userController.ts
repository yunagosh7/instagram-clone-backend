import { Request, Response } from "express";
import { User } from "../interfaces/User";

import bcrypt from "bcrypt";
import userModel from "../Models/userModel";
const deleteUser = async (req: Request, res: Response) => {
  if (req.user.username === req.params.username || req.user.role === "admin") {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
};
const updateUser = async (req: Request, res: Response) => {
  if (String(req.user?._id) === req.params.id || req.user.role === "admin") {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        res.status(500).send({
          status: "failure",
          message: e.message,
        });
      }
    }
    try {
      const user = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      if (!user) {
        return res.status(400).send({
          status: "failure",
          message: "you can't update this account.",
        });
      }
      res.status(200).send({
        status: "success",
        message: "Account has been updated successfully",
        user: {
          ...user,
          password: undefined,
        },
      });
    } catch (e) {
      res.status(500).send({
        status: "failure",
        message: "something is wrong !",
      });
    }
  } else {
    return res.status(400).send({
      status: "failure",
      message: "you can't update this account.",
    });
  }
};
const getUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await userModel.findOne({ _id: id });
    if (!user) {
      throw new Error("user does not exist");
    }
    res.status(200).send({
      status: "success",
      message: "user info",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const user = await userModel.findOne({ username: username });
    if (!user) {
      throw new Error("user does not exist");
    }
    res.status(200).send({
      status: "success",
      message: "user info",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getFollowings = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const userfollowings = await userModel.findOne({ username: username });
    if (!userfollowings) {
      throw new Error("user does not exist");
    }
    const followings = await Promise.all(
      userfollowings.followings.map((following: User) => {
        return userModel.findById(following, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      followings: followings,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getFollowers = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const userfollowers = await userModel.findOne({ username: username });
    if (!userfollowers) {
      throw new Error("user does not exist");
    }
    const followers = await Promise.all(
      userfollowers.followers.map((follower: User) => {
        return userModel.findById(follower, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      data: {
        followings: followers,
      },
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const followUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await userModel.findById({ _id: req.user._id });
    if (currentUser.username !== req.params.username) {
      const usertofollow = await userModel.findOne({
        username: req.params.username,
      });
      if (!usertofollow) {
        throw new Error("user does not exist");
      }
      if (!currentUser.followings.includes(usertofollow._id)) {
        await currentUser.updateOne({
          $push: { followings: usertofollow._id },
        });
        await usertofollow.updateOne({
          $push: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been followed",
        });
      } else {
        res.status(400).send({
          status: "success",
          message: "you allready follow this user",
        });
      }
    } else {
      throw new Error("you can't follow yourself");
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const unfollowUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await userModel.findById({ _id: req.user._id });
    if (currentUser.username !== req.params.username) {
      const usertounfollow = await userModel.findOne({
        username: req.params.username,
      });
      if (!usertounfollow) {
        throw new Error("user does not exist");
      }
      if (currentUser.followings.includes(usertounfollow._id)) {
        await currentUser.updateOne({
          $pull: { followings: usertounfollow._id },
        });
        await usertounfollow.updateOne({
          $pull: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been unfollowed",
        });
      } else {
        res.status(400).send({
          status: "success",
          message: "you don't follow this user",
        });
      }
    } else {
      throw new Error("you can't unfollow yourself");
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const searchUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search || "";
    const users = await userModel.find({
      username: { $regex: search, $options: "i" },
    })
      .select("_id username profilePicture")
      .limit(limit);
    const totalUsers = users.length;
    res.status(200).send({
      status: "success",
      totalUsers: totalUsers,
      limit: limit,
      users: users,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
export {
  deleteUser,
  updateUser,
  getUser,
  getFollowings,
  getFollowers,
  followUser,
  unfollowUser,
  searchUsers,
  getUserByUsername,
}