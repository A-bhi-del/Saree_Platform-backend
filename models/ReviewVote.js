import mongoose from "mongoose";

const reviewVoteSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

reviewVoteSchema.index({ review: 1, user: 1 }, { unique: true });

const ReviewVote = mongoose.model("ReviewVote", reviewVoteSchema);

export default ReviewVote;
