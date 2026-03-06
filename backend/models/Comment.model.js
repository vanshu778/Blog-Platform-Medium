import mongoose from "mongoose"

const { Schema, model } = mongoose

// ─── Comment Schema ───────────────────────────────────────────────────────────
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for fast lookups by post
commentSchema.index({ post: 1, createdAt: -1 })

export default model("Comment", commentSchema)
