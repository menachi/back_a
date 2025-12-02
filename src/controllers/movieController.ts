import Movie from "../model/movieModel";
import { Request, Response } from "express";

const getMovie = async (req: Request, res: Response) => {
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
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

const getMovieById = async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(id);
  try {
    const movie = await Movie.findById(id);
    console.log("getMovieById =" + movie);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    } else {
      res.json(movie);
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

const postMovie = async (req: Request, res: Response) => {
  const obj = req.body;
  console.log(obj);
  try {
    const response = await Movie.create(obj);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

const deleteMovie = async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(id);
  try {
    const response = await Movie.findByIdAndDelete(id);
    res.send(response);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

const putMovie = async (req: Request, res: Response) => {
  const id = req.params.id;
  const obj = req.body;
  console.log(id, obj);
  try {
    const response = await Movie.findByIdAndUpdate(id, obj, { new: true });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export default {
  getMovie,
  getMovieById,
  postMovie,
  deleteMovie,
  putMovie,
};
