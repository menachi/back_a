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
const userModel_1 = __importDefault(require("../model/userModel"));
const movieModel_1 = __importDefault(require("../model/movieModel"));
const testUtils_1 = require("./testUtils");
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield userModel_1.default.deleteMany({});
    yield movieModel_1.default.deleteMany({});
}));
afterAll((done) => {
    done();
});
describe("Auth API", () => {
    test("access restricted url denied", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/movie").send(testUtils_1.singleMovieData);
        expect(response.statusCode).toBe(401);
    }));
    test("test register", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/register").send({
            email: testUtils_1.userData.email,
            password: testUtils_1.userData.password
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("token");
        testUtils_1.userData._id = response.body._id;
        testUtils_1.userData.token = response.body.token;
    }));
    test("test access with token permitted1", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/movie")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(testUtils_1.singleMovieData);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
    }));
    test("test access with modified token restricted", () => __awaiter(void 0, void 0, void 0, function* () {
        const newToken = testUtils_1.userData.token + "m";
        const response = yield (0, supertest_1.default)(app).post("/movie")
            .set("Authorization", "Bearer " + newToken)
            .send(testUtils_1.singleMovieData);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    }));
    test("test login", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send({
            email: testUtils_1.userData.email,
            password: testUtils_1.userData.password
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        testUtils_1.userData.token = response.body.token;
    }));
    test("test access with token permitted2", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/movie")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(testUtils_1.singleMovieData);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        testUtils_1.singleMovieData._id = response.body._id;
    }));
    //set jest timeout to 10s
    jest.setTimeout(10000);
    test("test token expiration", () => __awaiter(void 0, void 0, void 0, function* () {
        // Assuming the token expiration is set to 5 second for testing purposes
        yield new Promise(resolve => setTimeout(resolve, 6000)); // wait for 6 seconds
        const response = yield (0, supertest_1.default)(app).post("/movie")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(testUtils_1.singleMovieData);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    }));
});
//# sourceMappingURL=auth.test.js.map