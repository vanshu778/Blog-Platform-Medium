// Global error handling middleware — catches all errors passed via next(err)

const errorMiddleware = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production"

  if (isDev) {
    console.error(err.stack)
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    stack: isDev ? err.stack : undefined,
  })
}

export default errorMiddleware
