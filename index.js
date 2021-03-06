const extendOptions = require('./options');
const route = require('./routing');

module.exports = function (app, options) {
  const { routes, controllers } = extendOptions(options);
  route(app, routes, controllers);
}
