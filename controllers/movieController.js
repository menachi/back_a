const movie = require("../model/movieModel");

const getMovie = (req, res) => {
  movie.create({ title: "Star Wars", releaseYear: 1977 });
  res.send("get star wars");
};

const postMovie = (req, res) => {
  res.send("post star wars");
};

const deleteMovie = (req, res) => {
  res.send("delete star wars");
};

const putMovie = (req, res) => {
  res.send("put star wars");
};

module.exports = {
  getMovie,
  postMovie,
  deleteMovie,
  putMovie,
};
