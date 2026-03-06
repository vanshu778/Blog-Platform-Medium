import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const { Schema, model } = mongoose

// ─── User Schema ─────────────────────────────────────────────────────────────
const userSchema = new Schema(
  {
    // Basic identity fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Google OAuth ID
    googleId: {
      type: String,
      default: null,
    },

    // Profile details
    bio: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    // Social graph — array of User references
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Bookmarked posts
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
)

// ─── Pre-save Hook: Hash password before saving ───────────────────────────────
userSchema.pre("save", async function () {
  // Skip hashing for Google OAuth users (no password) or if password wasn't modified
  if (!this.password || !this.isModified("password")) return

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// ─── Instance Method: Compare entered password with hashed password ───────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default model("User", userSchema)
