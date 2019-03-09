# WIP
  
  Coming soon... Ignore!.

# Plugin Authoring

There is one main difference between middleware and plugins. 

- runs after all other middleware.
- has access to the controller name and the route object

##### Example Plugin.

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
      console.error("Something went wrong!");
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

For this use case, it makes sense for your plugin to recieve function that we're assuming will do whatever is neccesary to determine if a request should have access to the controller. We'll also require that an error handler is provided in case of an error.

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

Next we're creating a function that will recieve the request, response and resolve arguments from switchboard. (this is "the plugin" that switchboard accepts)

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






