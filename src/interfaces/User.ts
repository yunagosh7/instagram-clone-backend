import { Document, HydratedDocument, ObjectId } from "mongoose";

export interface User {
    _id: ObjectId;
    username: string;
    email: string;
    password: string;
    description: string;
    profilePicture: string;
    followers: User[];
    followings: User[];
    role: "admin" | "user";
    gender: "male" | "female";
    jwtToken: string;
}
