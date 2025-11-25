const express = require("express");
const app = express();
const mongoose = require("mongoose");

const myAsyncFunc = () => {
  const pr = new Promise()((resolve) => {
    resolve(13);
  });
  return pr;
};

const intApp = () => {
  const promise = new Promise((resolve, reject) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    const movieRoutes = require("./routes/movieRoutes");
    app.use("/movie", movieRoutes);

    mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        resolve(app);
      });
    const db = mongoose.connection;
    db.on("error", (error) => {
      console.error(error);
    });
    db.once("open", () => {
      console.log("Connected to MongoDB");
    });
  });
  return promise;
};

module.exports = intApp;
