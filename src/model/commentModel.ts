import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  writerId: {
    type: String,
    required: true,
  },
});


export default mongoose.model("comment", commentSchema);
