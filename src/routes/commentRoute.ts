import { Router } from "express";
import { authController } from "../controllers/authController";
import { commentController } from "../controllers/commentController";

const router = Router();

router.post("/", authController.verify, commentController.addComment);
router.get("/:articleId", commentController.getbyPostId);


export default router