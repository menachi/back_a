import request from "supertest";
import intApp from "../index";
import Movies from "../model/movieModel";
import { Express } from "express";

type Movie = {
  title: string;
  releaseYear: number;
  _id?: string;
};
var testData: Movie[] = [
  { title: "Movie A", releaseYear: 2000 },
  { title: "Movie B", releaseYear: 2001 },
  { title: "Movie C", releaseYear: 2002 },
];

let app: Express;
beforeAll(async () => {
  app = await intApp();
  await Movies.deleteMany({});
});

afterAll((done) => {
  done();
});

describe("Movies API", () => {
  test("test get all empty db", async () => {
    console.log("Test is running");
    const response = await request(app).get("/movie");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("test post movie", async () => {
    //add all movies from testData
    for (const movie of testData) {
      const response = await request(app).post("/movie").send(movie);
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(movie);
    }
  });

  test("test get movies after post", async () => {
    const response = await request(app).get("/movie");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testData.length);
  });

  test("test get movies with filter", async () => {
    const movie = testData[0];
    const response = await request(app).get(
      "/movie?releaseYear=" + movie.releaseYear
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].releaseYear).toBe(movie.releaseYear);
    testData[0]._id = response.body[0]._id;
  });

  test("test get movie by id", async () => {
    const response = await request(app).get("/movie/" + testData[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testData[0]._id);
  });

  test("test put movie by id", async () => {
    testData[0].releaseYear = 2010;
    const response = await request(app)
      .put("/movie/" + testData[0]._id)
      .send(testData[0]);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(testData[0].title);
    expect(response.body.releaseYear).toBe(testData[0].releaseYear);
  });

  test("test delete movie by id", async () => {
    const response = await request(app).delete("/movie/" + testData[0]._id);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get("/movie/" + testData[0]._id);
    expect(getResponse.statusCode).toBe(404);
  });
});
