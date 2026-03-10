// Validate that all required environment variables are set before the server starts

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
]

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:")
    missing.forEach((key) => console.error(`   - ${key}`))
    console.error("\nSee .env.example for reference.")
    process.exit(1)
  }

  if (
    process.env.JWT_SECRET === "CHANGE_ME" ||
    process.env.JWT_REFRESH_SECRET === "CHANGE_ME"
  ) {
    console.warn("⚠️  Warning: Using default JWT secrets. Generate secure secrets for production.")
    console.warn("   Run: openssl rand -base64 64")
  }
}

export default validateEnv
