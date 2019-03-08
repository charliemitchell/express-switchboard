class PostsController {
  constructor (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
  }

  posts (req, res, next) {
    return this;
  }
  
  findPost (req, res, next) {
    return this;
  }
}

module.exports = PostsController;