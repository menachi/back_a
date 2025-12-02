import express from "express";
const router = express.Router();
import movieController from "../controllers/movieController";

router.get("/", movieController.get.bind(movieController));

router.get("/:id", movieController.getById.bind(movieController));

router.post("/", movieController.post.bind(movieController));

router.delete("/:id", movieController.del.bind(movieController));

router.put("/:id", movieController.put.bind(movieController));

export default router;
