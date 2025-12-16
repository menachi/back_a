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
exports.registerTestUser = exports.commentsData = exports.singleMovieData = exports.moviesData = exports.userData = void 0;
const supertest_1 = __importDefault(require("supertest"));
const userModel_1 = __importDefault(require("../model/userModel"));
exports.userData = {
    email: "test@testMovies.com",
    password: "testpasswordMovies",
};
exports.moviesData = [
    { title: "Movie A", releaseYear: 2000 },
    { title: "Movie B", releaseYear: 2001 },
    { title: "Movie C", releaseYear: 2002 },
];
exports.singleMovieData = { title: "Movie A", releaseYear: 2000 };
exports.commentsData = [
    { message: "Great movie!", movieId: "movie1" },
    { message: "Loved it!", movieId: "movie1" },
    { message: "Not bad.", movieId: "movie2" },
    { message: "Worst movie ever.", movieId: "movie2" },
    { message: "Could be better.", movieId: "movie3" },
];
const registerTestUser = (app) => __awaiter(void 0, void 0, void 0, function* () {
    yield userModel_1.default.deleteMany({ "email": exports.userData.email });
    const res = yield (0, supertest_1.default)(app).post("/auth/register").send({
        email: exports.userData.email,
        password: exports.userData.password
    });
    exports.userData._id = res.body._id;
    exports.userData.token = res.body.token;
});
exports.registerTestUser = registerTestUser;
//# sourceMappingURL=testUtils.js.map