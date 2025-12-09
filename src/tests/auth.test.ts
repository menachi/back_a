import request from "supertest";
import intApp from "../index";
import { Express } from "express";
import User from "../model/userModel";
import Movie from "../model/movieModel";
import { userData, singleMovieData } from "./testUtils";

let app: Express;
beforeAll(async () => {
    app = await intApp();
    await User.deleteMany({});
    await Movie.deleteMany({});
});

afterAll((done) => {
    done();
});

describe("Auth API", () => {
    test("access restricted url denied", async () => {
        const response = await request(app).post("/movie").send(singleMovieData);
        expect(response.statusCode).toBe(401);
    });

    test("test register", async () => {
        const response = await request(app).post("/auth/register").send({
            email: userData.email,
            password: userData.password
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("token");
        userData._id = response.body._id;
        userData.token = response.body.token;
    });

    test("test access with token permitted1", async () => {
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + userData.token)
            .send(singleMovieData);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
    });

    test("test access with modified token restricted", async () => {
        const newToken = userData.token + "m";
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + newToken)
            .send(singleMovieData);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    test("test login", async () => {
        const response = await request(app).post("/auth/login").send({
            email: userData.email,
            password: userData.password
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        userData.token = response.body.token;
    });

    test("test access with token permitted2", async () => {
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + userData.token)
            .send(singleMovieData);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        singleMovieData._id = response.body._id;
    });

    //set jest timeout to 10s
    jest.setTimeout(10000);

    test("test token expiration", async () => {
        // Assuming the token expiration is set to 5 second for testing purposes
        await new Promise(resolve => setTimeout(resolve, 6000)); // wait for 6 seconds
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + userData.token)
            .send(singleMovieData);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

});