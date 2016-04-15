var app = require('./server');
var loopback = require('loopback');
var request = require('supertest');
var winston = require('winston');
var should = require('chai').should();
var spy = require('sinon').spy;
var stub = require('sinon').stub;

// Test model
var Product = loopback.PersistedModel.extend('product', {
	name: {type: 'string', required: true},
	price: {type: 'number', default: 1}
});

Product.attachTo(loopback.memory());
app.model(Product);

//
var component = require('../index');
var transport = new winston.transports.MockTransport();

spy(transport, 'log');

// register logger
component(app, {
	transports: [
		transport,
		//{type: 'Console', colorize: true}
	]
});

// register middleware
app.use(component.requestLogger({
	msg: '${res.statusCode} ${req.method} ${req.decodedUrl}',
	meta: false
}));
app.use('/api', loopback.rest());
//app.middleware('final', component.failureLogger({}));

describe('middleware', function() {

	beforeEach(function() {
		return Product.create([{name: 'Pera', price: 1}, {name: 'Orange', price: 2}]);

	});

	afterEach(function() {
		transport.log.reset();
	});

	it('should report GET', function(done) {
		request(app)
			.get('/api/products')
			.query({filter: {where: {name: 'Pera'}}})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function() {
				transport.log.should.be.calledWith(
					'info', '200 GET /api/products?filter[where][name]=Pera');
			})
			.expect(200, done);
	});

	it('should report POST', function(done) {
		request(app)
			.post('/api/products')
			.send({name: 'Apples', price: 100})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function() {
				transport.log.should.be.calledWith(
					'info', '200 POST /api/products');
			})
			.expect(200, done);
	});

});
