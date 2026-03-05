import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

// Connect to MongoDB Atlas using the URI from environment variables
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB Connected")
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message)
    process.exit(1)
  }
}

export default connectDB
