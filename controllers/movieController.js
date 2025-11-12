const Movie = require("../model/movieModel");

const getMovie = async (req, res) => {
  const filter = req.query;
  console.log(filter);
  try {
    if (filter.releaseYear) {
      const movies = await Movie.find(filter);
      res.json(movies);
    } else {
      const movies = await Movie.find();
      res.json(movies);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMovieById = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const movie = await Movie.findById(id);
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postMovie = async (req, res) => {
  const obj = req.body;
  console.log(obj);
  try {
    const response = await Movie.create(obj);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMovie = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const response = await Movie.findByIdAndDelete(id);
    res.send(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const putMovie = async (req, res) => {
  const id = req.params.id;
  const obj = req.body;
  console.log(id, obj);
  try {
    const response = await Movie.findByIdAndUpdate(id, obj, { new: true });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMovie,
  getMovieById,
  postMovie,
  deleteMovie,
  putMovie,
};
