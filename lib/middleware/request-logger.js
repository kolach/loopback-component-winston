const _ = require('lodash');

module.exports = function(options) {
  options = options || {};

  const level = options.level || 'info';
  const msg = options.msg ||
  '${res.statusCode} ${req.method} ${res.time}ms ${req.decodedUrl}';
  const meta = options.meta;

  // Using mustache style templating
  const msgTemplate = _.template(msg);

  function responseTimeMillisec(start) {
    const diff = process.hrtime(start);
    const ms = diff[0] * 1e3 + diff[1] * 1e-6;

    return parseFloat(ms).toFixed(2);
  }

  function responseBody(chunk, headers) {
    const isJSON = headers && headers['content-type'] &&
    headers['content-type'].indexOf('json') >= 0;

    return isJSON ? JSON.parse(chunk) : chunk.toString();
  }

  function details(req, res) {
    const metaData = {
      req: {
        url: req.url,
        originalUrl: req.originalUrl,
        method: req.method,
        httpVersion: req.httpVersion,
        headers: req.headers,
        query: req.query,
        body: req.body,
      },
      res: {
        statusCode: res.statusCode,
        responseTime: res.responseTime,
        headers: res._headers,
        body: res.body,
      },
    };

    return JSON.stringify(metaData, null, 2);
  }

  return function(req, res, next) {
    const log = req.app.log;

    const start = process.hrtime();

    if (meta) {
      // Building response body
      // Overriding res.end method
      const end = res.end;

      res.end = function(chunk, encoding) {
        res.end = end;
        res.end(chunk, encoding);
        // Getting response body
        res.body = responseBody(chunk, res._headers);
      };
    }

    // On finish, profile response time and log
    res.once('finish', function() {
      // Calculating response time
      res.time = responseTimeMillisec(start);

      // Fixing URL property
      req.url = req.originalUrl || req.url;
      req.decodedUrl = decodeURIComponent(req.url);

      const msg = msgTemplate({req: req, res: res});

      if (meta) {
        log.log(level, msg, details(req, res));
      } else {
        log.log(level, msg);
      }
    });

    next();
  };
};
