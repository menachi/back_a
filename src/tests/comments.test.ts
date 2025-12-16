import request from "supertest";
import intApp from "../index";
import Comments from "../model/commentModel";
import { Express } from "express";
import User from "../model/userModel";
import { registerTestUser, userData, commentsData } from "./testUtils";

let app: Express;
beforeAll(async () => {
  app = await intApp();
  await Comments.deleteMany({});
  await registerTestUser(app);
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
    //add all comments from commentsData
    for (const comment of commentsData) {
      const response = await request(app).post("/comment")
        .set("Authorization", "Bearer " + userData.token)
        .send(comment);
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(comment);
    }
  });

  test("test get comments after post", async () => {
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(commentsData.length);
  });

  test("test get comments with filter", async () => {
    const comment = commentsData[0];
    const response = await request(app).get(
      "/comment?movieId=" + comment.movieId
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);

    const comment2 = commentsData[4];
    const response2 = await request(app).get(
      "/comment?movieId=" + comment2.movieId
    );
    expect(response2.statusCode).toBe(200);
    expect(response2.body.length).toBe(1);
    commentsData[4]._id = response2.body[0]._id;
  });

  test("test get comment by id", async () => {
    const response = await request(app).get("/comment/" + commentsData[4]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentsData[4]._id);
  });

  test("test put comment by id", async () => {
    commentsData[4].message = "this is the new text";
    const response = await request(app)
      .put("/comment/" + commentsData[4]._id)
      .set("Authorization", "Bearer " + userData.token)
      .send(commentsData[4]);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(commentsData[4].message);
  });

  test("test delete comment by id", async () => {
    const response = await request(app).delete("/comment/" + commentsData[4]._id)
      .set("Authorization", "Bearer " + userData.token);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get("/comment/" + commentsData[4]._id);
    expect(getResponse.statusCode).toBe(404);
  });
});
