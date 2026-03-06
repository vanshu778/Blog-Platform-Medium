// Notification model — stores follow, reaction, and comment notifications
import mongoose from "mongoose"

const { Schema, model } = mongoose

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["follow", "reaction", "comment"],
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

notificationSchema.index({ recipient: 1, createdAt: -1 })

export default model("Notification", notificationSchema)
