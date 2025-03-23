const fs = require("fs"),
  path = require("path"),
  logger = require("../lib/logger");

module.exports = function() {
  // check and create logging directory.
  if (!fs.existsSync(path.join(__dirname, "/../logs"))) {
    fs.mkdirSync(path.join(__dirname, "/../logs"));
  }

  // initalize the logger
  logger.init(path.join(__dirname, "/../logs"));
};
