const winston = require('winston');
const Transport = require('winston-transport');
const util = require('util');

function MockTransport(options) {
  Transport.call(this, options || {});
};

MockTransport.prototype.log = function(info, callback) {
  callback();
};

util.inherits(MockTransport, Transport);

winston.transports['MockTransport'] = MockTransport;

module.exports = MockTransport;
