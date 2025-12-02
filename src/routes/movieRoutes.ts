import express from "express";
const router = express.Router();
import movieController from "../controllers/movieController";

router.get("/", movieController.getMovie);

router.get("/:id", movieController.getMovieById);

router.post("/", movieController.postMovie);

router.delete("/:id", movieController.deleteMovie);

router.put("/:id", movieController.putMovie);

export default router;
