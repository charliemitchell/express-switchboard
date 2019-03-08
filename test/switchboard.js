require('rooty')();
var assert = require('assert');
var switchboard = require('^index');

describe('Express Switchboard', () => {
  it('works', () => {
    let mockApp = getMockApp();
    switchboard(mockApp, { routes: './test/mock/routes', controllers: './test/mock/controllers' });
    let [ path, middleware ] = mockApp.registered.filter((x) => {
      return x[0] === '/posts/:id'
    })[0];
    assert.equal(path, '/posts/:id');
    assert.equal(middleware(), 'middleware');
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
