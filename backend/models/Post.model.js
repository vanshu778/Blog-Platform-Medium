import mongoose from "mongoose"
import slugify from "slugify"

const { Schema, model } = mongoose

// ─── Post Schema ──────────────────────────────────────────────────────────────
const postSchema = new Schema(
  {
    // Core content fields
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    // Auto-generated from title — user does NOT supply this
    slug: {
      type: String,
      unique: true,
    },

    // Stores raw HTML output from a rich text editor (e.g. Tiptap, Quill)
    content: {
      type: String,
      required: [true, "Content is required"],
    },

    // Auto-generated plain-text preview — user does NOT supply this
    excerpt: {
      type: String,
    },

    coverImage: {
      type: String,
      default: "",
    },

    // Reference to the author User document
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },

    // Tags stored lowercase and trimmed
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // Users who clapped for this post
    claps: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Auto-calculated reading time in minutes
    readTime: {
      type: Number,
      default: 1,
    },

    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
)

// ─── Pre-save Hook ─────────────────────────────────────────────────────────────
postSchema.pre("save", function () {
  // 1. Auto-generate slug from title whenever title changes
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) + "-" + Date.now()
  }

  // 2. Auto-generate excerpt and calculate readTime when content changes
  if (this.isModified("content")) {
    // Strip all HTML tags to get plain text
    const plainText = this.content.replace(/<[^>]+>/g, "")

    // Calculate read time: average reading speed ~200 words/min, minimum 1 min
    const wordCount = plainText.split(/\s+/).filter(Boolean).length
    this.readTime = Math.max(1, Math.ceil(wordCount / 200))

    // Excerpt: first 160 characters of plain text
    this.excerpt = plainText.slice(0, 160) + "..."
  }
})

export default model("Post", postSchema)
