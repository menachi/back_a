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
const testUtils_1 = require("./testUtils");
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield movieModel_1.default.deleteMany({});
    yield (0, testUtils_1.registerTestUser)(app);
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
        for (const movie of testUtils_1.moviesData) {
            const response = yield (0, supertest_1.default)(app).post("/movie")
                .set("Authorization", "Bearer " + testUtils_1.userData.token)
                .send(movie);
            expect(response.statusCode).toBe(201);
            expect(response.body).toMatchObject(movie);
        }
    }));
    test("test get movies after post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/movie");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testUtils_1.moviesData.length);
    }));
    test("test get movies with filter", () => __awaiter(void 0, void 0, void 0, function* () {
        const movie = testUtils_1.moviesData[0];
        const response = yield (0, supertest_1.default)(app).get("/movie?releaseYear=" + movie.releaseYear);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].releaseYear).toBe(movie.releaseYear);
        testUtils_1.moviesData[0]._id = response.body[0]._id;
    }));
    test("test get movie by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/movie/" + testUtils_1.moviesData[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testUtils_1.moviesData[0]._id);
    }));
    test("test put movie by id", () => __awaiter(void 0, void 0, void 0, function* () {
        testUtils_1.moviesData[0].releaseYear = 2010;
        const response = yield (0, supertest_1.default)(app)
            .put("/movie/" + testUtils_1.moviesData[0]._id)
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(testUtils_1.moviesData[0]);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(testUtils_1.moviesData[0].title);
        expect(response.body.releaseYear).toBe(testUtils_1.moviesData[0].releaseYear);
    }));
    test("test delete movie by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/movie/" + testUtils_1.moviesData[0]._id)
            .set("Authorization", "Bearer " + testUtils_1.userData.token);
        expect(response.statusCode).toBe(200);
        const getResponse = yield (0, supertest_1.default)(app).get("/movie/" + testUtils_1.moviesData[0]._id);
        expect(getResponse.statusCode).toBe(404);
    }));
    // Search API Tests
    describe("Movie Search API", () => {
        test("test search with valid query returns 501 not implemented", () => __awaiter(void 0, void 0, void 0, function* () {
            const searchQuery = {
                query: "action movies from the 90s",
                limit: 10,
                offset: 0
            };
            const response = yield (0, supertest_1.default)(app)
                .post("/movie/search")
                .send(searchQuery);
            expect(response.statusCode).toBe(501);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Search functionality not implemented yet");
        }));
        test("test search with minimal query", () => __awaiter(void 0, void 0, void 0, function* () {
            const searchQuery = {
                query: "Matrix"
            };
            const response = yield (0, supertest_1.default)(app)
                .post("/movie/search")
                .send(searchQuery);
            expect(response.statusCode).toBe(501);
            expect(response.body).toHaveProperty("error");
        }));
        test("test search with empty query body returns error", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/movie/search")
                .send({});
            // Should return 501 for now, but will need validation later
            expect([400, 501]).toContain(response.statusCode);
        }));
        test("test search with large query string", () => __awaiter(void 0, void 0, void 0, function* () {
            const longQuery = "a".repeat(1000); // 1000 character query
            const searchQuery = {
                query: longQuery,
                limit: 10
            };
            const response = yield (0, supertest_1.default)(app)
                .post("/movie/search")
                .send(searchQuery);
            // Currently returns 501, but should handle long queries appropriately
            expect([400, 501]).toContain(response.statusCode);
        }));
        test("test search endpoint accepts POST method only", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get("/movie/search");
            // Express returns 500 for unhandled routes when there's an error, or 404 for not found
            expect([404, 500]).toContain(response.statusCode);
        }));
        test("test search response structure when implemented", () => __awaiter(void 0, void 0, void 0, function* () {
            const searchQuery = {
                query: "sci-fi movies",
                limit: 10,
                offset: 0
            };
            const response = yield (0, supertest_1.default)(app)
                .post("/movie/search")
                .send(searchQuery);
            // Currently 501, but when implemented should have proper structure
            if (response.statusCode === 200) {
                expect(response.body).toHaveProperty("results");
                expect(response.body).toHaveProperty("metadata");
                expect(response.body.metadata).toHaveProperty("query");
                expect(response.body.metadata).toHaveProperty("totalResults");
                expect(response.body.metadata).toHaveProperty("searchType");
                expect(response.body.metadata).toHaveProperty("confidence");
                expect(Array.isArray(response.body.results)).toBe(true);
            }
            else {
                expect(response.statusCode).toBe(501);
            }
        }));
    });
});
//# sourceMappingURL=movies.test.js.map