import { Router } from "express";
import { authController } from "../controllers/authController";
import { userController } from "../controllers/userController";

const router = Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logOut);
router.post("/refresh", authController.refresh);
router.get("/searchUser", userController.searchUsers);
router.get("/u/:username", userController.getUserByUsername);
router.get("/:id", userController.getUser);
router.get("/followings/:username", userController.getFollowings);
router.get("/followers/:username", userController.getFollowers);
router.put("/:id", authController.verify, userController.updateUser);
router.put(
  "/:username/follow",
  authController.verify,
  userController.followUser
);
router.put(
  "/:username/unfollow",
  authController.verify,
  userController.unfollowUser
);

export default router