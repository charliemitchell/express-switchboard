require('rooty')();
var assert = require('assert');
var options = require('^options');

describe('Options', () => {

  it('should provide the default options with no arguments', () => {
    let opts = options();
    assert.equal(typeof opts, 'object')
    assert.equal(opts.routes, './routes')
  });

  it('the defaults should be overwritten with arguments ', () => {
    let opts = options({ routes: './my/routes', controllers: './my/controllers' });
    assert.equal(typeof opts, 'object')
    assert.equal(opts.routes, './my/routes')
    assert.equal(opts.controllers, './my/controllers')
  });

  it('controller default should be overwritten with arguments ', () => {
    let opts = options({ controllers: './my/controllers' });
    assert.equal(typeof opts, 'object')
    assert.equal(opts.routes, './routes')
    assert.equal(opts.controllers, './my/controllers')
  });

  it('route default should be overwritten with arguments ', () => {
    let opts = options({ routes: './my/routes' });
    assert.equal(typeof opts, 'object')
    assert.equal(opts.routes, './my/routes')
    assert.equal(opts.controllers, './controllers')
  });

});
