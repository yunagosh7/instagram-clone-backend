import { Router } from "express";
import { authController } from "../controllers/authController";
import { articleController } from "../controllers/articleController";

const router = Router()

router.post("/", authController.verify, articleController.createArticle);
router.put("/:id", authController.verify, articleController.updateArticle);
router.delete("/:id", authController.verify, articleController.deleteArticle);
router.get("/timeline", authController.verify, articleController.getTimeline);
router.get("/u/:username", articleController.getArticlesUser);
router.get("/:id", articleController.getArticle);
router.get("/:id/like", authController.verify, articleController.likeUnlike);

export default router