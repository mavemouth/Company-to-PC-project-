const { logger } = require('./errorHandler');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the request
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = { requestLogger };