export interface User {
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



