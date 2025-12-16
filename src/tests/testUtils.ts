import { Express } from "express";
import request from "supertest";
import User from "../model/userModel";

type UserData = {
    email: string;
    password: string;
    _id?: string;
    token?: string;
    refreshToken?: string;
};
export const userData: UserData = {
    email: "test@testMovies.com",
    password: "testpasswordMovies",

};

export type MoviesData = {
    title: string;
    releaseYear: number;
    _id?: string;
};
export var moviesData: MoviesData[] = [
    { title: "Movie A", releaseYear: 2000 },
    { title: "Movie B", releaseYear: 2001 },
    { title: "Movie C", releaseYear: 2002 },
];

export const singleMovieData: MoviesData =
    { title: "Movie A", releaseYear: 2000 };

export type CommentsData = {
    message: string;
    movieId: string;
    writerId?: string;
    _id?: string;
};

export var commentsData: CommentsData[] = [
    { message: "Great movie!", movieId: "movie1" },
    { message: "Loved it!", movieId: "movie1" },
    { message: "Not bad.", movieId: "movie2" },
    { message: "Worst movie ever.", movieId: "movie2" },
    { message: "Could be better.", movieId: "movie3" },
];

export const registerTestUser = async (app: Express) => {
    await User.deleteMany({ "email": userData.email });

    const res = await request(app).post("/auth/register").send({
        email: userData.email,
        password: userData.password
    });
    userData._id = res.body._id;
    userData.token = res.body.token;
}