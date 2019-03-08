module.exports = function (options) {
  const defaultOptions = {
    routes: './routes',
    controllers: './controllers'
  };
  return Object.assign(defaultOptions, options || {});
};
