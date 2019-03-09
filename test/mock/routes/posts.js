const SUCCESS_PLUGINS = [
  function (req, res, resolve) {
    resolve();
  }
];

const ERROR_PLUGINS = [
  function (req, res, resolve) {
    throw new Error()
  }
]

module.exports = {
  get: [
    {
      path: '/posts',
      action: 'posts'
    }, {
      path: '/posts/:id',
      action: 'findPost',
      middleware: [
        function (req, res, next) {
          return 'middleware';
        }
      ]
    }
  ],
  post: [
    {
      path: '/post/success',
      action: 'posts',
      plugins: SUCCESS_PLUGINS
    },
    {
      path: '/post/error',
      action: 'posts',
      plugins: ERROR_PLUGINS
    }
  ]
}
