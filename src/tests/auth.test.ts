import request from "supertest";
import intApp from "../index";
import { Express } from "express";
import User from "../model/userModel";
import Movie from "../model/movieModel";

let app: Express;
beforeAll(async () => {
    app = await intApp();
    await User.deleteMany({});
    await Movie.deleteMany({});
});

afterAll((done) => {
    done();
});

const user = {
    email: "test@test.com",
    password: "testpassword",
    _id: "",
    token: ""
}
type Movie = {
    title: string;
    releaseYear: number;
    _id?: string;
};
const movie: Movie = {
    title: "Test Movie",
    releaseYear: 2023
}


describe("Auth API", () => {
    test("access restricted url denied", async () => {
        const response = await request(app).post("/movie").send(movie);
        expect(response.statusCode).toBe(401);
    });

    test("test register", async () => {
        const response = await request(app).post("/auth/register").send({
            email: user.email,
            password: user.password
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("token");
        user._id = response.body._id;
        user.token = response.body.token;
    });

    test("test access with token permitted1", async () => {
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + user.token)
            .send(movie);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
    });

    test("test access with modified token restricted", async () => {
        const newToken = user.token + "m";
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + newToken)
            .send(movie);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    test("test login", async () => {
        const response = await request(app).post("/auth/login").send({
            email: user.email,
            password: user.password
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        user.token = response.body.token;
    });

    test("test access with token permitted2", async () => {
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + user.token)
            .send(movie);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        movie._id = response.body._id;
    });

    //set jest timeout to 10s
    jest.setTimeout(10000);

    test("test token expiration", async () => {
        // Assuming the token expiration is set to 5 second for testing purposes
        await new Promise(resolve => setTimeout(resolve, 6000)); // wait for 6 seconds
        const response = await request(app).post("/movie")
            .set("Authorization", "Bearer " + user.token)
            .send(movie);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

});