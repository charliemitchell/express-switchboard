require('rooty')();
var assert  = require('assert');
var route = require('^routing');

describe('Routing', function () {
  
  it('should execute app[method]', function () {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    assert.equal(mockApp.registered.length, 3)
  });

});

describe('Routing Errors', function () {

  it('should error on a route/controller mismatch', function () {
    let mockApp = getMockApp();
    assert.throws(function() { route(mockApp, './test/mock/routes', './test/mock/missing-controllers') }, Error);
  });

  it('should have correct error message on a route/controller mismatch', function () {
    let mockApp = getMockApp();
    assert.throws(function() { route(mockApp, './test/mock/routes', './test/mock/missing-controllers') }, /No controller for your route "post.js" was found. Check that the route and the controller names match exactly/);
  });
})

describe('Routing - Express Arguments', function () {
  it('should pass in the correct args to app', function () {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered[0];
    assert.equal(path, '/post');
    assert.equal(typeof callback, 'function')
  });
});

describe('Routing - Controller Arguments', function () {
  it('should pass in the correct args to the controller', function () {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered[0];
    let instance = callback(1,2,3);
    assert.equal(instance.req, 1)
    assert.equal(instance.res, 2)
    assert.equal(instance.next, 3)
  });
});

describe('Routing - middleware', function () {
  it('should pass in the middleware', function () {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, middleware ] = mockApp.registered.filter(x => x[0] === '/posts/:id')[0];
    assert.equal(path, '/posts/:id');
    assert.equal(middleware(), 'middleware');
  });

  it('should pass in the middleware and controller should be last', function () {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, middleware, callback ] = mockApp.registered.filter(x => x[0] === '/posts/:id')[0];
    assert.equal(path, '/posts/:id');
    assert.equal(middleware(), 'middleware');
    assert.equal(callback('req').req, 'req');
  });
});

function getMockApp () {
  return {
    registered: [],
    get (...args) {
      this.registered.push(args)
    },
    put (...args) {
      this.registered.push(args)
    },
    post (...args) {
      this.registered.push(args)
    }
  }
}