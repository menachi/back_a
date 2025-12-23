import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "movie",
    required: true,
  },
  writerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});


export default mongoose.model("comment", commentSchema);
