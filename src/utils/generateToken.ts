import jwt from "jsonwebtoken"
import { User } from "../interfaces/User";

export const generateAccessToken = (user: User) => {
  return jwt.sign(
    { username: user.username, role: user.role, _id: user._id },
    "mySecretKeyfromenv",
    { expiresIn: "2s" }
  );
};
export const generateRefreshToken = (user: User) => {
  return jwt.sign(
    { username: user.username, role: user.role, _id: user._id },
    "myRefreshSecretKeyfromenv"
  );
};

