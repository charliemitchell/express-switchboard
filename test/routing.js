require('rooty')();
var assert = require('assert');
var route = require('^routing');

describe('Routing', () => {
  it('should execute app[method]', () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    assert.equal(mockApp.registered.length, 5)
  });
});

describe('Routing Errors', () => {
  it('should error on a route/controller mismatch', () => {
    let mockApp = getMockApp();
    assert.throws(() => {
      route(mockApp, './test/mock/routes', './test/mock/missing-controllers')
    }, Error);
  });

  it('should have correct error message on a route/controller mismatch', () => {
    let mockApp = getMockApp();
    assert.throws(() => {
      route(mockApp, './test/mock/routes', './test/mock/missing-controllers')
    }, /No controller for your route "post.js" was found. Check that the route and the controller names match exactly/);
  });
})

describe('Routing - Express Arguments', () => {
  it('should pass in the correct args to app', () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered[0];
    assert.equal(path, '/post');
    assert.equal(typeof callback, 'function')
  });
});

describe('Routing - Controller Arguments', () => {
  it('should pass in the correct args to the controller', () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered[0];
    let instance = callback(1, 2, 3);
    assert.equal(instance.req, 1)
    assert.equal(instance.res, 2)
    assert.equal(instance.next, 3)
  });
});

describe('Routing - middleware', () => {
  it('should pass in the middleware', () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, middleware ] = mockApp.registered.filter((x) => {
      return x[0] === '/posts/:id'
    })[0];
    assert.equal(path, '/posts/:id');
    assert.equal(middleware(), 'middleware');
  });

  it('should pass in the middleware and controller should be last', () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, middleware, callback ] = mockApp.registered.filter((x) => {
      return x[0] === '/posts/:id'
    })[0];
    assert.equal(path, '/posts/:id');
    assert.equal(middleware(), 'middleware');
    assert.equal(callback('req').req, 'req');
  });
});

describe('Routing - plugins', () => {
  
  it('should pass through the plugins', async () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered.filter((x) => {
      return x[0] === '/post/success'
    })[0];
    let controller = await callback({},{});
    assert.equal(controller.constructor.name, 'PostsController');
  });

  it('should set _switchboard_controller', async () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered.filter((x) => {
      return x[0] === '/post/success'
    })[0];
    let controller = await callback({},{});
    assert.equal(controller.constructor.name, 'PostsController');
  });

  it('should not pass through the plugins when reject is called', async () => {
    let mockApp = getMockApp();
    route(mockApp, './test/mock/routes', './test/mock/controllers');
    let [ path, callback ] = mockApp.registered.filter((x) => {
      return x[0] === '/post/error'
    })[0];
    let err = await callback({},{});
    assert.equal(err, undefined);
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
