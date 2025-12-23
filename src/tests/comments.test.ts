import request from "supertest";
import intApp from "../index";
import Comments from "../model/commentModel";
import { Express } from "express";
import User from "../model/userModel";
import Movie from "../model/movieModel";
import { registerTestUser, userData, commentsData, moviesData } from "./testUtils";

let app: Express;
let testMovieIds: string[] = [];
let testCommentId: string;

beforeAll(async () => {
  app = await intApp();
  await Comments.deleteMany({});
  await Movie.deleteMany({});
  await registerTestUser(app);

  // Create test movies first to get real IDs for comments
  for (const movie of moviesData) {
    const response = await request(app).post("/movie")
      .set("Authorization", "Bearer " + userData.token)
      .send(movie);
    testMovieIds.push(response.body._id);
  }
});

afterAll((done) => {
  done();
});

describe("Comments API", () => {
  test("test get all empty db", async () => {
    console.log("Test is running");
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("test post comment", async () => {
    // Create comment data with real movie IDs
    const testCommentsData = [
      { message: "Great movie!", movieId: testMovieIds[0] },
      { message: "Loved it!", movieId: testMovieIds[0] },
      { message: "Not bad.", movieId: testMovieIds[1] },
      { message: "Worst movie ever.", movieId: testMovieIds[1] },
      { message: "Could be better.", movieId: testMovieIds[2] },
    ];

    for (const comment of testCommentsData) {
      const response = await request(app).post("/comment")
        .set("Authorization", "Bearer " + userData.token)
        .send(comment);
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe(comment.message);
      expect(response.body.movieId).toBe(comment.movieId);
    }
  });

  test("test get comments after post", async () => {
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(5); // 5 comments were posted
  });

  test("test get comments with filter", async () => {
    // Test filtering by first movie ID (should have 2 comments)
    const response = await request(app).get(
      "/comment?movieId=" + testMovieIds[0]
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);

    // Test filtering by third movie ID (should have 1 comment)
    const response2 = await request(app).get(
      "/comment?movieId=" + testMovieIds[2]
    );
    expect(response2.statusCode).toBe(200);
    expect(response2.body.length).toBe(1);

    // Store the comment ID for later tests
    testCommentId = response2.body[0]._id;
  });

  test("test get comment by id", async () => {
    const response = await request(app).get("/comment/" + testCommentId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testCommentId);
  });

  test("test put comment by id", async () => {
    const updatedMessage = "this is the new text";
    const response = await request(app)
      .put("/comment/" + testCommentId)
      .set("Authorization", "Bearer " + userData.token)
      .send({ message: updatedMessage });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(updatedMessage);
  });

  test("test delete comment by id", async () => {
    const response = await request(app)
      .delete("/comment/" + testCommentId)
      .set("Authorization", "Bearer " + userData.token);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get("/comment/" + testCommentId);
    expect(getResponse.statusCode).toBe(404);
  });
});
