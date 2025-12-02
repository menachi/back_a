import request from "supertest";
import intApp from "../index";
import Comments from "../model/commentModel";
import { Express } from "express";

type Comment = {
  message: string;
  movieId: string;
  writerId: string;
  _id?: string;
};

var testData: Comment[] = [
  { message: "Great movie!", movieId: "movie1", writerId: "user1" },
  { message: "Loved it!", movieId: "movie1", writerId: "user4" },
  { message: "Not bad.", movieId: "movie2", writerId: "user2" },
  { message: "Worst movie ever.", movieId: "movie2", writerId: "user1" },
  { message: "Could be better.", movieId: "movie3", writerId: "user3" },
];

let app: Express;
beforeAll(async () => {
  app = await intApp();
  await Comments.deleteMany({});
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
    //add all comments from testData
    for (const comment of testData) {
      const response = await request(app).post("/comment").send(comment);
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(comment);
    }
  });

  test("test get comments after post", async () => {
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testData.length);
  });

  test("test get comments with filter", async () => {
    const comment = testData[0];
    const response = await request(app).get(
      "/comment?movieId=" + comment.movieId
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);

    const comment2 = testData[4];
    const response2 = await request(app).get(
      "/comment?movieId=" + comment2.movieId
    );
    expect(response2.statusCode).toBe(200);
    expect(response2.body.length).toBe(1);
    testData[4]._id = response2.body[0]._id;
  });

  test("test get comment by id", async () => {
    const response = await request(app).get("/comment/" + testData[4]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testData[4]._id);
  });

  test("test put comment by id", async () => {
    testData[4].message = "this is the new text";
    const response = await request(app)
      .put("/comment/" + testData[4]._id)
      .send(testData[4]);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(testData[4].message);
  });

  test("test delete comment by id", async () => {
    const response = await request(app).delete("/comment/" + testData[4]._id);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get("/comment/" + testData[4]._id);
    expect(getResponse.statusCode).toBe(404);
  });
});
