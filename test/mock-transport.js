var winston = require('winston');

function MockTransport(options) {
	this.name = 'mock';

	winston.Transport.call(this, options || {});

	this.log = function(level, msg, meta, cb) {
		return cb();
	};
}

winston.transports['MockTransport'] = MockTransport;

module.exports = MockTransport;
