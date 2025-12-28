import mongoose from "mongoose";

export type MovieRecord = {
  _id?: string;
  title: string;
  releaseYear: number;
  createdBy: string;
  description?: string;
}

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  description: {
    type: String,
  }
});

export default mongoose.model("movie", movieSchema);
