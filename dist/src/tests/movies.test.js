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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const movieModel_1 = __importDefault(require("../model/movieModel"));
var testData = [
    { title: "Movie A", releaseYear: 2000 },
    { title: "Movie B", releaseYear: 2001 },
    { title: "Movie C", releaseYear: 2002 },
];
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield movieModel_1.default.deleteMany({});
}));
afterAll((done) => {
    done();
});
describe("Movies API", () => {
    test("test get all empty db", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Test is running");
        const response = yield (0, supertest_1.default)(app).get("/movie");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("test post movie", () => __awaiter(void 0, void 0, void 0, function* () {
        //add all movies from testData
        for (const movie of testData) {
            const response = yield (0, supertest_1.default)(app).post("/movie").send(movie);
            expect(response.statusCode).toBe(201);
            expect(response.body).toMatchObject(movie);
        }
    }));
    test("test get movies after post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/movie");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testData.length);
    }));
    test("test get movies with filter", () => __awaiter(void 0, void 0, void 0, function* () {
        const movie = testData[0];
        const response = yield (0, supertest_1.default)(app).get("/movie?releaseYear=" + movie.releaseYear);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].releaseYear).toBe(movie.releaseYear);
        testData[0]._id = response.body[0]._id;
    }));
    test("test get movie by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/movie/" + testData[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testData[0]._id);
    }));
    test("test put movie by id", () => __awaiter(void 0, void 0, void 0, function* () {
        testData[0].releaseYear = 2010;
        const response = yield (0, supertest_1.default)(app)
            .put("/movie/" + testData[0]._id)
            .send(testData[0]);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(testData[0].title);
        expect(response.body.releaseYear).toBe(testData[0].releaseYear);
    }));
    test("test delete movie by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/movie/" + testData[0]._id);
        expect(response.statusCode).toBe(200);
        const getResponse = yield (0, supertest_1.default)(app).get("/movie/" + testData[0]._id);
        expect(getResponse.statusCode).toBe(404);
    }));
});
//# sourceMappingURL=movies.test.js.map