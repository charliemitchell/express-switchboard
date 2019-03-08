class PostController {
  constructor (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
  }

  post (req, res, next) {
    return this;
  }
}

module.exports = PostController;