# Express Switchboard

| [SYNTAX](#use-cases) | [CONTROLLERS](#controllers) | [PLUGINS](#plugin-authoring) |
| :---: | :---: | :---: |

Express Switchboard is a library for Express.js that adds organization to your express project through an advanced routing schema, controllers, middleware and plugins.

---

Each endpoint in your application is divided based on a resource like user, post, etc.. (your models).

```
project
│
└───routes
│   │   posts.js
│   │   users.js
│
└───controllers
|   │   posts.js
|   │   users.js
|
|   ...
```

The 2 main concepts are routing and controllers. This library makes no assumptions regarding application code other than controllers should be classes. The routing is described via a route file. A route file is an object containing all of the routes available for that resource. An individual route consists of a path (url), the name of the controller action that will handle the request, and any middleware or plugins specific to that route. Examples of middleware would be a specific body parser, or file uploader (like multer), to session middleware or tracking. Plugins (See Plugin Authoring) are also a form of middleware that get get injected after all other midddleware.

---
**Example of how a route and controller are tied together**.
If a GET request comes in for `/posts` then switchboard will receive the request, apply any applicable middleware or plugins, and route the request to the `posts` controller and invoke the `getAllPosts` method on the controller.

```
project
│
└───routes
│   │   posts.js                                  ┌────────────────┐
│   └──── { get: [{ path: '/posts', action: 'getAllPosts' }] }     |
│                                                                  │
└───controllers                                                    │
|   │   posts.js                                                   │
|   └───┐ class PostsController {                                  │
|       |             ┌────────────────────────────────────────────┘
|       |   async getAllPosts (req, res) {
|       |     let posts = await Posts.all();
|       |     res.json(posts);
|       |   }
|       |
|       | }
|
```

---

**Example Route File**

```js
//routes/posts.js
module.exports = {
  get: [
    {
      path: '/posts',
      action: 'getPosts'
    },{
      path: '/post/:id',
      action: 'getPost'
    }
  ],
  post: [
    {
      path: '/posts',
      action: 'createPost'
    }
  ],
  put: [
    {
      path: '/post/:id',
      action: 'updatePost',
      middleware: [ ensureCurrentUserIsPostOwner ]
    }
  ],
  DELETE: [
    {
      path: '/post/:id',
      action: 'deletePost',
      middleware: [ ensureCurrentUserIsPostOwner ]
    }
  ]
  /* etc... for all request methods supported by express */
};
```

The object keys are the request methods, they are case insensitive. Each request method contains an array of routes for that method.

Ex: All "Built in" options for a route object.
```js

{
  path: '/posts',
  action: 'getPosts',
  middleware: [], // Any express middleware
  plugins: [] // express-switchboard style plugins (see Plugin Authoring) or an example https://github.com/charliemitchell/express-switchboard-policies
}

```

Plugins may request extending a route object with additional configuration if necessary.

---

## Controllers

Controllers need to be classes.
This library makes no assumptions on how your application code should be except that
controllers should be classes, and they will receive the express `req`, `res` as their parameters.

Example Controller:

```
class MyController {

  someAction (request, response) {
    // ... do stuff
  }

  // ... other actions

}
```

middleware and plugins should strive to write to the request object if what they do is needed in the controller.


---

## Plugin Authoring

There is one main difference between middleware and plugins. 

- runs after all other middleware.
- has access to the controller name and the route object

**Example Plugin**

Below we'll create a plugin that adds `myField` to the request object.

```js
module.exports = function () {
  return function (req, res, resolve) {
    try {
      let { _switchboard_controller, _switchboard_route } = req;
      if (_switchboard_route.addSomethingToRequest) {
        req.myField = 'myData';
      }
      resolve();
    } catch (err) {
      console.error("Ahhh something went wrong! :(");
      resolve();
    }
  }
}
```

Now let's create a plugin to see whether or not a user should have access to a controller. 

```js
module.exports = function (policyChecker, onError) {
  if (!onError) {
    throw new Error("an error handler is required to use this plugin [name-of-plugin etc...]");
  }
  return function (req, res, resolve) {
    try {
      let { _switchboard_controller, _switchboard_route } = req;
      if (_switchboard_route.policy) {
        _switchboard_route.policy(req, res, resolve);
      } else {
        resolve();
      }
    } catch (err) {
      onError(err, resolve);
    }
  }
}
```

Break down.

---

For this use case, it makes sense for your plugin to receive function that we're assuming will do whatever is necessary to determine if a request should have access to the controller. We'll also require that an error handler is provided in case of an error.

```js
module.exports = function (policyChecker, onError) {
```
---

Making sure that an error handler was passed in, because we don't want errors going into the ether.

```js
if (!onError) {
  throw new Error("an error handler is required to use this plugin [name-of-plugin etc...]");
}
```

---

Next we're creating a function that will receive the request, response and resolve arguments from switchboard. (this is "the plugin" that switchboard accepts)

```js
return function (req, res, resolve) {
```

---

SwitchBoard asserts that plugin authors must be responsible for handling their own errors, so let's add a try/catch block. `try {`

---

SwitchBoard will add the controller name and the route object to the request object, we'll need that.

```
let { _switchboard_controller, _switchboard_route } = req;
```

---

For this example we're asserting that the user of our plugin should add a key to the route object named `policy`. When our plugin encounters this key we will execute the policy passing in the request/response objects from express as well as the resolve method which continues the chain of plugin execution, which is akin to saying "we'll allow it". If there is no policy, then we'll continue the chain of plugin execution (allowing access to the controller)

```js
if (_switchboard_route.policy) {
  _switchboard_route.policy(req, res, resolve);
} else {
  resolve();
}
```

---

Lastly we'll implement the catch block, passing the error back such that it can be handled.

```
catch (err) {
  onError(err, resolve);
}
```

---

## Use Cases

**basic use case**
```
const express = require('express');
const app = express();
const expressSwitchboard = require('express-switchboard');

expressSwitchboard(app);

app.listen(3000, function () {
  console.log('Server listening on port 3000');
})
```

**basic use case with options.**
```
const express = require('express');
const app = express();
const expressSwitchboard = require('express-switchboard');

expressSwitchboard(app, {
  routes: './some-other-folder-for-routes',
  controllers: './some-other-folder-for-controllers'
});

app.listen(3000, function () {
  console.log('Server listening on port 3000');
})
```
Options allow you to specify a different directory for your routes and/or controllers


**using other libraries**
```
const express = require('express');
const app = express();
const helmet = require('helmet);
const expressSwitchboard = require('express-switchboard');

app.use(helmet);

expressSwitchboard(app);

app.listen(3000, function () {
  console.log('Server listening on port 3000');
})
```


