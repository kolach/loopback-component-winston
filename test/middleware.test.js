const loopback = require('loopback');
const request = require('supertest');
const winston = require('winston');
const format = winston.format;
const sinon = require('sinon');
const spy = sinon.spy;
const stub = sinon.stub;


const component = require('../index');
const mockTransport = new winston.transports.MockTransport();
let products;

// Server startup
function start(registerMiddleware, done) {
  // Create server
  const app = loopback();
  const PORT = 3031;

  app.set('legacyExplorer', false);
  app.set('remoting.context', false);

  // register model
  const Product = loopback.PersistedModel.extend('product', {
    name: {type: 'string', required: true},
    price: {type: 'number', default: 1},
  });

  Product.attachTo(loopback.memory());
  app.model(Product);

  // register logger
  component(app, {
    transports: [
      mockTransport,
      {
        type: 'Console',
        format: format.colorize({all: true}),
      },
      {
        type: 'Console',
        format: {
          timestamp: {},
          colorize: {all: true},
          printf: function(info) {
            return info.timestamp + ' info: ' + info.level + ' message: ' +
            info.message;
          },
        },
      },
    ],
  });

  // Middleware registration
  registerMiddleware(app);
  app.use('/api', loopback.rest());

  // Start server
  const listener = app.listen(PORT, function() {
    // add stop method
    app.stop = function(cb) {
      listener.close(cb);
    };
    // Create models to run tests
    Product.create([
      {name: 'Apple', price: 1},
      {name: 'Banana', price: 2},
      {name: 'Pear', price: 3},
      {name: 'Orange', price: 4},
    ], function(err, models) {
      products = models;
      done();
    });
  });

  return app;
}

describe('middleware', function() {
  let app;

  beforeEach(function() {
    spy(mockTransport, 'log');

    // Stubbing to always have 1.5ms
    stub(process, 'hrtime')
        .onFirstCall().returns([0, 0])
        .onSecondCall().returns([0, 1500000]);
  });

  afterEach(function(done) {
    mockTransport.log.restore();
    process.hrtime.restore();
    app.stop(done);
  });

  context('without metadata', function() {
    beforeEach(function(done) {
      app = start(function(app) {
        // register middleware
        app.use(component.requestLogger({
          msg: '${res.statusCode} ${req.method} ${res.time}ms ' +
          '${req.decodedUrl}',
          meta: false,
        }));
        //
      }, done);
    });

    it('should report GET', function(done) {
      request(app)
          .get('/api/products')
          .query({filter: {where: {name: 'Pear'}}})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(function() {
            mockTransport.log.should.be.calledWith({
              level: 'info',
              message: '200 GET 1.50ms /api/products?filter[where][name]=Pear',
            });
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
            mockTransport.log.should.be.calledWith({
              level: 'info',
              message: '200 POST 1.50ms /api/products',
            });
          })
          .expect(200, done);
    });

    it('should report DELETE', function(done) {
      request(app)
          .delete('/api/products/' + products[0].id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(function() {
            mockTransport.log.should.be.calledWith({
              level: 'info',
              message: '200 DELETE 1.50ms /api/products/' + products[0].id,
            });
          })
          .expect(200, done);
    });

    it('should report PUT', function(done) {
      request(app)
          .put('/api/products/' + products[0].id)
          .send({name: 'Mango', price: 15})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(function() {
            mockTransport.log.should.be.calledWith({
              level: 'info',
              message: '200 PUT 1.50ms /api/products/' + products[0].id,
            });
          })
          .expect(200, done);
    });
  });
});
