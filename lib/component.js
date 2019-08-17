const winston = require('winston');

module.exports = function(app, options) {
  options = options || {};
  const defaultTransport = {type: 'Console'};
  const defaultName = 'log';
  const name = options.name || defaultName;

  delete options.name;

  // Parses transports JSON array
  // Returns array of winston transport objects
  function parseTransports() {
    const transports = options.transports || [defaultTransport];

    if (transports.constructor.name !== 'Array') {
      throw new Error('transports should be Array');
    }
    if (transports.length === 0) {
      throw new Error('No transport was specified');
    }

    return transports.map(function(transport) {
      if (transport.constructor.name === 'Object') {
        // Expects transport is POJO descriptor from componentes JSON file
        const transportType = transport.type;

        if (!transportType) {
          throw new Error(
              'type property is not specified for transport descriptor: ' +
              JSON.stringify(transport)
          );
        }

        const winstonTransportType = winston.transports[transportType];

        if (!winstonTransportType) {
          throw new Error('unsupported transport type specified: ' +
          transportType);
        }

        delete transport.type;

        if (transport.format &&
          'Object' === transport.format.constructor.name) {
          const formats = parseFormat(transport.format);

          transport.format = formats.length === 1 ? formats[0] :
          winston.format.combine.apply(null, formats);
        }

        return new winston.transports[transportType](transport);
      } else {
        // Expects transport is already created,
        // no parsing needed
        return transport;
      }
    });
  }

  function parseFormat(format) {
    const formats = [];

    const keys = Object.keys(format);

    keys.forEach(function(key) {
      const options = format[key];
      const winstonFormat = winston.format[key];

      if (!winstonFormat) {
        throw new Error('unsupported format specified: ' + key);
      }

      formats.push(winstonFormat(options));
    });

    return formats;
  }

  options.transports = parseTransports(options);

  app[name] = winston.createLogger(options);
};
