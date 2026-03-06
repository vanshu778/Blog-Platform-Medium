// Global error handling middleware — catches all errors passed via next(err)

const errorMiddleware = (err, req, res, next) => {
  if (process.env.DEV === "true") {
    console.error(err.stack)
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    stack: process.env.DEV === "true" ? err.stack : undefined,
  })
}

export default errorMiddleware
