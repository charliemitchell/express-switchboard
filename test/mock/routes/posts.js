module.exports = {
  get: [
    {
      path: '/posts',
      action: 'posts'
    },{
      path: '/posts/:id',
      action: 'findPost',
      middleware: [
        function (req, res, next) {
          return 'middleware';
        }
      ]
    }
  ]
}