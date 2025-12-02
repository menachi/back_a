"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const movieModel_1 = __importDefault(require("../model/movieModel"));
const getMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.query;
    console.log(filter);
    try {
        if (filter.releaseYear) {
            const movies = yield movieModel_1.default.find(filter);
            res.json(movies);
        }
        else {
            const movies = yield movieModel_1.default.find();
            res.json(movies);
        }
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
const getMovieById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    try {
        const movie = yield movieModel_1.default.findById(id);
        console.log("getMovieById =" + movie);
        if (!movie) {
            return res.status(404).json({ error: "Movie not found" });
        }
        else {
            res.json(movie);
        }
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
const postMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const obj = req.body;
    console.log(obj);
    try {
        const response = yield movieModel_1.default.create(obj);
        res.status(201).json(response);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    try {
        const response = yield movieModel_1.default.findByIdAndDelete(id);
        res.send(response);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
const putMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const obj = req.body;
    console.log(id, obj);
    try {
        const response = yield movieModel_1.default.findByIdAndUpdate(id, obj, { new: true });
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.default = {
    getMovie,
    getMovieById,
    postMovie,
    deleteMovie,
    putMovie,
};
//# sourceMappingURL=movieController.js.map