const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

router.get("/", movieController.getMovie);

router.get("/:id", movieController.getMovieById);

router.post("/", movieController.postMovie);

router.delete("/:id", movieController.deleteMovie);

router.put("/:id", movieController.putMovie);

module.exports = router;
