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
const commentModel_1 = __importDefault(require("../model/commentModel"));
const movieModel_1 = __importDefault(require("../model/movieModel"));
const testUtils_1 = require("./testUtils");
let app;
let testMovieIds = [];
let testCommentId;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield commentModel_1.default.deleteMany({});
    yield movieModel_1.default.deleteMany({});
    yield (0, testUtils_1.registerTestUser)(app);
    // Create test movies first to get real IDs for comments
    for (const movie of testUtils_1.moviesData) {
        const response = yield (0, supertest_1.default)(app).post("/movie")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(movie);
        testMovieIds.push(response.body._id);
    }
}));
afterAll((done) => {
    done();
});
describe("Comments API", () => {
    test("test get all empty db", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Test is running");
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("test post comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create comment data with real movie IDs
        const testCommentsData = [
            { message: "Great movie!", movieId: testMovieIds[0] },
            { message: "Loved it!", movieId: testMovieIds[0] },
            { message: "Not bad.", movieId: testMovieIds[1] },
            { message: "Worst movie ever.", movieId: testMovieIds[1] },
            { message: "Could be better.", movieId: testMovieIds[2] },
        ];
        for (const comment of testCommentsData) {
            const response = yield (0, supertest_1.default)(app).post("/comment")
                .set("Authorization", "Bearer " + testUtils_1.userData.token)
                .send(comment);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe(comment.message);
            expect(response.body.movieId).toBe(comment.movieId);
        }
    }));
    test("test get comments after post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(5); // 5 comments were posted
    }));
    test("test get comments with filter", () => __awaiter(void 0, void 0, void 0, function* () {
        // Test filtering by first movie ID (should have 2 comments)
        const response = yield (0, supertest_1.default)(app).get("/comment?movieId=" + testMovieIds[0]);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        // Test filtering by third movie ID (should have 1 comment)
        const response2 = yield (0, supertest_1.default)(app).get("/comment?movieId=" + testMovieIds[2]);
        expect(response2.statusCode).toBe(200);
        expect(response2.body.length).toBe(1);
        // Store the comment ID for later tests
        testCommentId = response2.body[0]._id;
    }));
    test("test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment/" + testCommentId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testCommentId);
    }));
    test("test put comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedMessage = "this is the new text";
        const response = yield (0, supertest_1.default)(app)
            .put("/comment/" + testCommentId)
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send({ message: updatedMessage });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(updatedMessage);
    }));
    test("test delete comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/comment/" + testCommentId)
            .set("Authorization", "Bearer " + testUtils_1.userData.token);
        expect(response.statusCode).toBe(200);
        const getResponse = yield (0, supertest_1.default)(app).get("/comment/" + testCommentId);
        expect(getResponse.statusCode).toBe(404);
    }));
});
//# sourceMappingURL=comments.test.js.map