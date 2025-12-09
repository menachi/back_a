import express from "express";
const router = express.Router();
import movieController from "../controllers/movieController";
import authMiddleware from "../middleware/authMiddleware";

router.get("/", movieController.get.bind(movieController));

router.get("/:id", movieController.getById.bind(movieController));

router.post("/", authMiddleware, movieController.post.bind(movieController));

router.delete("/:id", authMiddleware, movieController.del.bind(movieController));

router.put("/:id", authMiddleware, movieController.put.bind(movieController));

export default router;
