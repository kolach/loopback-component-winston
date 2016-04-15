var WinstonComponent = require('./lib/component');

WinstonComponent.requestLogger = require('./lib/middleware/request-logger');
WinstonComponent.failureLogger = require('./lib/middleware/failure-logger');

module.exports = WinstonComponent;
