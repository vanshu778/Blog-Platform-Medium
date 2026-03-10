// Validates that all required environment variables are set before the server starts.
// Exits with a clear error message if any are missing.

const required = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"]

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === "")

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables:\n${missing.map((k) => `   - ${k}`).join("\n")}`
    )
    process.exit(1)
  }
}

export default validateEnv
