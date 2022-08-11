const fs = require('fs');
const path = require('path');
const filterJS = file => (/(\.js)$/).test(file);
const development = process.env.NODE_ENV === 'development';

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
    let Controller = controllerPaths.find(controller => router.name === controller.name);
    if (!Controller) {
      throw new Error(`No controller for your route "${router.name}" was found. Check that the route and the controller names match exactly`);
    }
    let methods = Object.keys(router.ref);

    methods.forEach((method) => {

      router.ref[method].forEach((route) => {

        let args = [ route.path ];

        if (route.middleware) {
          args = args.concat(route.middleware)
        }

        args.push((req, res, next) => {
          let i = 0;
          req._switchboard_controller = Controller.name;
          req._switchboard_route = route;
          if (route.plugins) {
            route.plugins.reduce((chain, plugin) => {
              return chain.then(() => {
                return plugin(req, res);
              });
            }, Promise.resolve([])).then(() => {
              new Controller.ref(req, res, next)[route.action]();
            }).catch(err => {
              if (development) {
                next(err);
              } else {
                res.status(500).send();
              }
              console.error('An Error occured within an express switchboard plugin that was not caught by the plugin author', err);
            });
          } else {
            new Controller.ref(req, res, next)[route.action]();
          }

        });
        app[method].apply(app, args);
      });
    });
  })
}
