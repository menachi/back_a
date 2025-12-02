import Movie from "../model/movieModel";
import { Request, Response } from "express";
import baseController from "./baseController";

const movieController = new baseController(Movie);

export default movieController;
