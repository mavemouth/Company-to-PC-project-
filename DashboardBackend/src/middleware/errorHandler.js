const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { 
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error response
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message),
      status: 400
    };
  } else if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      status: 400
    };
  } else if (err.code === 11000) {
    error = {
      message: 'Duplicate entry',
      status: 400
    };
  } else if (err.message) {
    error.message = err.message;
  }

  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  res.status(error.status || 500).json(error);
};

module.exports = { errorHandler, logger };