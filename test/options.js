require('rooty')();
var assert  = require('assert');
var options = require('^options');

describe('Options', function () {
  it('should provide the default options with no arguments', function () {
    var opts = options();
    assert.equal(typeof opts, 'object')
    assert.equal(opts.routes, './routes')
  });

  it('the defaults should be overwritten with arguments ', function () {
    var opts = options({routes: './my/routes', controllers: './my/controllers'});
    assert.equal(typeof opts, 'object')
    assert.equal(opts.routes, './my/routes')
    assert.equal(opts.controllers, './my/controllers')
  });
});