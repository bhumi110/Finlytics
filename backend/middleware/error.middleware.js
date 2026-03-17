exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const isDev = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : "Something went wrong",
    ...(isDev && { stack: err.stack })
  });
};

exports.notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};