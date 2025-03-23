// This is a simple logging process
// In production we should store logs externally in ElasticSearch, OpenSearch....
const winston = require("winston");

var logger;

module.exports = {
  /**
   * Create the logging object
   *
   * @param {String} logDir - directory path as String
   */
  init: function(logDir) {
      logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.File({
            filename: logDir + "/error.log",
            level: "error"
          }),
          new winston.transports.File({ filename: logDir + "/combined.log" })
        ]
      });
    
  },
  /**
   * This function print logging with info level.
   *
   * @param {String} message - input
   */
  info: function(message) {
    logger.info(message);
  },
  /**
   * This function print logging with error level.
   *
   * @param {Error} err - Error object
   */
  error: function(err) {
    logger.error(err.stack);
  }
};
