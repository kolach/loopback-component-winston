var winston = require('winston');
var Transport = require('winston-transport');
var util = require('util');

function MockTransport(options) {
	Transport.call(this, options || {});
};

MockTransport.prototype.log = function(info, callback) {
	callback();
};

util.inherits(MockTransport, Transport);

winston.transports['MockTransport'] = MockTransport;

module.exports = MockTransport;