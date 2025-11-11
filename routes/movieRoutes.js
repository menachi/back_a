const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

router.get("/", movieController.getMovie);

router.post("/", movieController.postMovie);

router.delete("/", movieController.deleteMovie);

router.put("/", movieController.putMovie);

module.exports = router;
