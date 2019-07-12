class UserController {
  constructor (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
  }

  getUser (req, res, next) {
    return this;
  }
}

module.exports = UserController;
