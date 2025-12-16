import express, { Express } from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.dev" });
import movieRoutes from "./routes/movieRoutes";
import commentRoutes from "./routes/commentRoutes";
import authRoutes from "./routes/authRoutes";
import { specs, swaggerUi } from "./swagger";

const intApp = () => {
  const promise = new Promise<Express>((resolve, reject) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Swagger Documentation
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Movie & Comments API Documentation"
    }));

    // Swagger JSON endpoint
    app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(specs);
    });

    app.use("/movie", movieRoutes);
    app.use("/comment", commentRoutes);
    app.use("/auth", authRoutes);

    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      console.error("MONGODB_URI is not defined in the environment variables.");
      reject(new Error("MONGODB_URI is not defined"));
    } else {
      mongoose
        .connect(dbUri, {})
        .then(() => {
          resolve(app);
        });
    }
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

export default intApp;
