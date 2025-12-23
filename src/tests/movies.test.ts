import request from "supertest";
import intApp from "../index";
import Movies from "../model/movieModel";
import { Express } from "express";
import User from "../model/userModel";
import { registerTestUser, userData, moviesData } from "./testUtils";

let app: Express;

beforeAll(async () => {
  app = await intApp();
  await Movies.deleteMany({});
  await registerTestUser(app);
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
    for (const movie of moviesData) {
      const response = await request(app).post("/movie")
        .set("Authorization", "Bearer " + userData.token)
        .send(movie);
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(movie);
    }
  });

  test("test get movies after post", async () => {
    const response = await request(app).get("/movie");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(moviesData.length);
  });

  test("test get movies with filter", async () => {
    const movie = moviesData[0];
    const response = await request(app).get(
      "/movie?releaseYear=" + movie.releaseYear
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].releaseYear).toBe(movie.releaseYear);
    moviesData[0]._id = response.body[0]._id;
  });

  test("test get movie by id", async () => {
    const response = await request(app).get("/movie/" + moviesData[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(moviesData[0]._id);
  });

  test("test put movie by id", async () => {
    moviesData[0].releaseYear = 2010;
    const response = await request(app)
      .put("/movie/" + moviesData[0]._id)
      .set("Authorization", "Bearer " + userData.token)
      .send(moviesData[0]);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(moviesData[0].title);
    expect(response.body.releaseYear).toBe(moviesData[0].releaseYear);
  });

  test("test delete movie by id", async () => {
    const response = await request(app).delete("/movie/" + moviesData[0]._id)
      .set("Authorization", "Bearer " + userData.token);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get("/movie/" + moviesData[0]._id);
    expect(getResponse.statusCode).toBe(404);
  });

  // Search API Tests
  describe("Movie Search API", () => {
    test("test search with valid query returns 501 not implemented", async () => {
      const searchQuery = {
        query: "action movies from the 90s",
        limit: 10,
        offset: 0
      };

      const response = await request(app)
        .post("/movie/search")
        .send(searchQuery);

      expect(response.statusCode).toBe(501);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Search functionality not implemented yet");
    });

    test("test search with minimal query", async () => {
      const searchQuery = {
        query: "Matrix"
      };

      const response = await request(app)
        .post("/movie/search")
        .send(searchQuery);

      expect(response.statusCode).toBe(501);
      expect(response.body).toHaveProperty("error");
    });

    test("test search with empty query body returns error", async () => {
      const response = await request(app)
        .post("/movie/search")
        .send({});

      // Should return 501 for now, but will need validation later
      expect([400, 501]).toContain(response.statusCode);
    });


    test("test search with large query string", async () => {
      const longQuery = "a".repeat(1000); // 1000 character query
      const searchQuery = {
        query: longQuery,
        limit: 10
      };

      const response = await request(app)
        .post("/movie/search")
        .send(searchQuery);

      // Currently returns 501, but should handle long queries appropriately
      expect([400, 501]).toContain(response.statusCode);
    });

    test("test search endpoint accepts POST method only", async () => {
      const response = await request(app)
        .get("/movie/search");

      // Express returns 500 for unhandled routes when there's an error, or 404 for not found
      expect([404, 500]).toContain(response.statusCode);
    });

    test("test search response structure when implemented", async () => {
      const searchQuery = {
        query: "sci-fi movies",
        limit: 10,
        offset: 0
      };

      const response = await request(app)
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
      } else {
        expect(response.statusCode).toBe(501);
      }
    });
  });
});
