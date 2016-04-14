var winston = require('winston');

function TestTransport(options) {
	this.options = options;
}

TestTransport.prototype.log = function() {};

winston.transports.TestTransport = TestTransport;

module.exports = TestTransport;
