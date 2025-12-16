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

export const registerTestUser = async (app: Express) => {
    await User.deleteMany({ "email": userData.email });

    const res = await request(app).post("/auth/register").send({
        email: userData.email,
        password: userData.password
    });
    userData._id = res.body._id;
    userData.token = res.body.token;
}