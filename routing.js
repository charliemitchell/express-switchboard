const fs = require('fs');
const path = require('path');
const filterJS = (file) => {
  return (/(\.js)$/).test(file)
};
const find = (iterable, iteree) => {
  let i = 0;
  let len = iterable.length;
  for (i; i < len; i = i + 1) {
    if (iteree(iterable[i])) {
      let item = iterable[i];
      iterable.splice(i, 1);
      return item;
    }
  }
}

module.exports = function (app, routes, controllers) {
  // get all controllers
  let controllerPaths = fs.readdirSync(controllers).filter(filterJS).map((file) => {
    return { name: file.split('/').slice(-1)[0], ref: require(`${path.join(process.cwd(), controllers, file)}`) }
  });
  // get all routes
  let routePaths = fs.readdirSync(routes).filter(filterJS).map((file) => {
    return { name: file.split('/').slice(-1)[0], ref: require(`${path.join(process.cwd(), routes, file)}`) }
  });

  // match them up
  routePaths.forEach((router) => {
    let Controller = find(controllerPaths, (controller) => {
      return router.name === controller.name
    });
    if (!Controller) {
      throw new Error(`No controller for your route "${router.name}" was found. Check that the route and the controller names match exactly`);
    }
    let methods = Object.keys(router.ref);
    methods.forEach((method) => {
      router.ref[method].forEach((route) => {
        if (route.middleware) {
          let args = [ route.path ].concat(route.middleware).concat((req, res, next) => {
            return new Controller.ref(req, res, next)[route.action]();
          });
          app[method].apply(app, args);
        } else {
          app[method](route.path, (req, res, next) => {
            return new Controller.ref(req, res, next)[route.action]();
          });
        }
      });
    });
  })
}
