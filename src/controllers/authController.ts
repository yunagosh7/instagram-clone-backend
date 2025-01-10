import { NextFunction, Request, Response } from "express";

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { User } from "../interfaces/User";
import userModel from "../Models/userModel";

const signUp = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { username, password, email } = data;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createduser = {
      username: username,
      password: hashedPassword,
      email: email,
    }
    await userModel.create(createduser);
    res.status(200).send({
      status: "success",
      message: "user saved successfully",
      data: {
        user: username,
      },
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username: username });
    if (!user) {
      return res.status(401).send({
        status: "failure",
        message: "user does not exist",
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({
        status: "failure",
        message: "password is incorrect",
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await userModel.findByIdAndUpdate(user._id, {
      jwtToken: refreshToken,
    });
    res.status(200).send({
      status: "success",
      message: "logged in successfully",
      user: {
        ...user,
        password: undefined,
      },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const logOut = async (req: Request, res: Response): Promise<any> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await userModel.updateOne({ jwtToken: refreshToken }, [
        { $unset: ["jwtToken"] },
      ]);
      res.status(200).send({
        status: "success",
        message: "You've been logged out",
      });
    } else {
      return res.status(400).send({
        status: "failure",
        message: "logout error",
      });
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const verify = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(403).json("You are not authorized");
  }
  const token = authHeader.split(" ")[1];
  try {
    if (authHeader) {
      jwt.verify(token, "YOUR_SECRET_KEY", (err, user: User) => {
        if (err) {
          throw new Error("token is not valid!");
        }
        req.user = user;
        next();
      });
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    res.status(401).send({
      status: "failure",
      message: "You are not authenticated!",
    });
  }
  try {
    const token = await userModel.findOne(
      { jwtToken: refreshToken },
      { jwtToken: true }
    );
    if (!token) {
      res.status(200).send({
        status: "failure",
        message: "Refresh token is not valid!",
      });
    }
    jwt.verify(
      refreshToken,
      "YOUR_SECRETKEY_REFRESHTOKEN",
      async (err: Error, user: User) => {
        if (err) {
          throw new Error("token is not valid!");
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        await userModel.updateOne(
          { jwtToken: refreshToken },
          { $set: { jwtToken: newRefreshToken } }
        );
        res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }
    );
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

export const authController = {
  signUp,
  login,
  logOut,
  verify,
  refresh,
};
