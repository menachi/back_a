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
var testData = [
    { message: "Great movie!", movieId: "movie1", writerId: "user1" },
    { message: "Loved it!", movieId: "movie1", writerId: "user4" },
    { message: "Not bad.", movieId: "movie2", writerId: "user2" },
    { message: "Worst movie ever.", movieId: "movie2", writerId: "user1" },
    { message: "Could be better.", movieId: "movie3", writerId: "user3" },
];
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield commentModel_1.default.deleteMany({});
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
        //add all comments from testData
        for (const comment of testData) {
            const response = yield (0, supertest_1.default)(app).post("/comment").send(comment);
            expect(response.statusCode).toBe(201);
            expect(response.body).toMatchObject(comment);
        }
    }));
    test("test get comments after post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testData.length);
    }));
    test("test get comments with filter", () => __awaiter(void 0, void 0, void 0, function* () {
        const comment = testData[0];
        const response = yield (0, supertest_1.default)(app).get("/comment?movieId=" + comment.movieId);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        const comment2 = testData[4];
        const response2 = yield (0, supertest_1.default)(app).get("/comment?movieId=" + comment2.movieId);
        expect(response2.statusCode).toBe(200);
        expect(response2.body.length).toBe(1);
        testData[4]._id = response2.body[0]._id;
    }));
    test("test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment/" + testData[4]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testData[4]._id);
    }));
    test("test put comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        testData[4].message = "this is the new text";
        const response = yield (0, supertest_1.default)(app)
            .put("/comment/" + testData[4]._id)
            .send(testData[4]);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(testData[4].message);
    }));
    test("test delete comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/comment/" + testData[4]._id);
        expect(response.statusCode).toBe(200);
        const getResponse = yield (0, supertest_1.default)(app).get("/comment/" + testData[4]._id);
        expect(getResponse.statusCode).toBe(404);
    }));
});
//# sourceMappingURL=comments.test.js.map