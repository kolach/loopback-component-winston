var loopback = require('loopback');
var path = require('path');
var winston = require('winston');

var should = require('chai').should();
var spy = require('sinon').spy;
var stub = require('sinon').stub;

require('./test-transport');

var app = loopback();

app.set('legacyExplorer', false);

var PORT = 3031;

var component = require('../index');

describe('loopback-component-winston', function() {

	var server = null;

	before(function(done) {
		server = app.listen(PORT, function() {
			done();
		});
	});

	after(function(done) {
		server.close(done);
	});

	beforeEach(function() {
	});

	it('should not throw if transports is not specified', function() {
		(function() {
			component(app, {});
		}).should.not.throw(Error);
	});

	it('should throw if transports specified as something other than Array', function() {
		(function() {
			component(app, {
				transports: {}
			});
		}).should.throw('transports should be Array');
	});

	it('should throw if transports specified as empty array', function() {
		(function() {
			component(app, {
				transports: []
			});
		}).should.throw('No transport was specified');
	});

	it('should throw if transport type is not specified', function() {
		(function() {
			component(app, {
				transports: [{level: 'info'}]
			});
		}).should.throw('type property is not specified for transport descriptor: {"level":"info"}');
	});

	it('should throw if unknown transport type is specified', function() {
		(function() {
			component(app, {
				transports: [{type: 'UnknownTransport'}]
			});
		}).should.throw('unsupported transport type specified: UnknownTransport');
	});

	it('should setup app.log property by default', function() {
		delete app.log;
		should.not.exist(app.log);
		component(app, {
			transports: [
				{type: 'TestTransport'}
			]
		});
		should.exist(app.log);
	});

	it('should not throw for manually contracted transport type', function() {
		(function() {
			component(app, {
				transports: [
					new winston.transports.TestTransport({})
				]
			});
		}).should.not.throw();
	});

	it('should allow  to setup any property in app', function() {
		delete app.errorLog;
		should.not.exist(app.errorLog);
		component(app, {
			name: 'errorLog',
			transports: [
				{type: 'TestTransport'}
			]
		});
		should.exist(app.errorLog);
	});

});
