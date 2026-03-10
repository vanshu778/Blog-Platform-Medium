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

    // null = top-level comment; ObjectId = reply to that comment
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Tracks if the comment was edited
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for fast lookups
commentSchema.index({ post: 1, parentId: 1, createdAt: 1 })
commentSchema.index({ parentId: 1 })

export default model("Comment", commentSchema)
