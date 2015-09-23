Service Locator
===========

Implementation of dependency injection approach using `Service Locator` pattern.

`Service Locator` is dependency injection pattern. The `Service Locator` pattern does not describe how to instantiate
the services. It describes a way to register **services** and **locate** them in a global point of access.
A `Service Locator` should be able to locate a **service** using a central registry without knowing its concrete type.
For example, it might use a string key which on request returns the object depending on code initialization.
This allows you to replace the concrete implementation of the dependency without modifying the objects.

## Advantages:

* option of adding extra attributes and methods using **mixin** pattern to all objects registered in `Service Locator`;
* option of **lazy instantiation**;
* un-registering instances;
* un-registering objects;
* applications can optimize themselves at run-time by selectively adding and removing items from the `Service Locator`;
* large sections of a library or application can be completely separated, the only link between them becomes the registry;
* solves the drawback of factories allows to manage the creation of objects automatically and centrally;

## Disadvantages:

* your classes have an extra dependency on the `Service Locator`;
* you have to write additional code to add **service references** to the locator before your service objects use it;
* objects placed in the **registry** are black boxed, this makes it harder to detect and recover from their errors,
and may make the system as a whole less reliable;
* sometimes **registry** can be a security vulnerability, because it allows outsiders to inject code into an application;
* the source code has added complexity, this makes the source code more difficult to understand;
* the registry hides the object dependencies, causing errors when dependencies are missing;
* the **registry** makes code harder to test, since all tests need to interact with the same global `Service Locator`
to set the fake dependencies of a service object under test;

### API

#### Require in Node

```javascript
var ServiceLocator = require("servicelocatorjs");
```

> printLog (flag?: boolean)

Takes _true/false_ values as a parameter.
When _true_, writes information about events and channels into the console.

```javascript
ServiceLocator.printLog(true);
```

> setMixin (objectWithMixins: Object)

Takes an object as a parameter.
The object contains a set of additional properties and/or methods, which have to contain all objects registered
in `Service Locator`.

```javascript
ServiceLocator.setMixin({
	mixinMethod: function () {}
});
```

> getMixin (): Object

Return current set mixins.

```javascript
ServiceLocator.getMixin();
```

> mixin(objectWithMixins?: Object): Object

Set and/or return mixins.

```javascript
ServiceLocator.mixin({
	mixinMethod: function () {}
});
```

> register (serviceName: String, serviceObject: Function|Object, instantiate?: boolean, constructorArguments?: Array): boolean

Registers an object **serviceObject** under the name **serviceName**.
The flag **instantiate** shows, whether lazy instantiation is required to request the object from `Service Locator`.
By default **instantiate** is _true_.

```javascript
ServiceLocator.register('serviceName', function (a, b) {
	this.a = a;
	this.b = b;
}, true, [1, 2]);
```

```javascript
ServiceLocator.register('serviceName', {
	a: 1,
	b: 2
});
```

> registerAll (arrayOfServices: Array): Array<String>

Calls the **register** function for each element of **arrayOfServices**.
Each element of the array must contain one of the **ID** or **id** properties for defining the object name,
and **service/object/creator** for defining the object under registration.
There is optional **instantiate**.

```javascript
ServiceLocator.registerAll([
	{
		/**
		 * @constructor
		 * @param {*} value
		 */
		creator: function (value) {
			this.prop = value;
		},
		id: 'ServiceFive',
		instantiate: false
	},
	{
		service: {
			prop: 'Some property'
		},
		id: 'ServiceSix'
	}
]);
```

> get (serviceName: String): null|Object

Returns the instance of a registered object with an indicated **serviceName** or creates a new one in the case of
lazy instantiation.

```javascript
ServiceLocator.get('serviceName')
```

> instantiate (serviceName: String): boolean

Instantiate service by name.

```javascript
ServiceLocator.instantiate('serviceName')
```

> instantiateAll (filter?: Function)

Instantiates and returns all registered objects.
Can take the **filter** function as an argument.
The **filter** function must return the logical value.
In case filter is predefined, only the services that underwent the check will be instantiated.

```javascript
ServiceLocator.instantiateAll(function (serviceName) {
	if (serviceName === 'ServiceName') {
		return false;
	} else {
		return true;
	}
})
```

> getAllInstantiate (asObject?: boolean): Array<Object>

Returns the array or object of instantiated service objects.

```javascript
ServiceLocator.getAllInstantiate(true);
```

> isRegistered (serviceName: String): boolean

Checks wherever service is registered.

```javascript
ServiceLocator.isRegistered('ServiceName');
```


> getAllRegistered (): Array<String>

Returns the array of registered service objects.

```javascript
ServiceLocator.getAllRegistered();
```

> isInstantiated (serviceName: String): boolean

Checks wherever service is instantiated.

```javascript
ServiceLocator.isInstantiated('ServiceName');
```

> removeInstance (serviceName: String): boolean

Deletes a service instance with an indicated **serviceName**.
Returns _false_ in case the service with the indicated **serviceName** is not found or has no **instance**.
This do not remove service itself, only instances of it.

```javascript
ServiceLocator.removeInstance('ServiceName');
```

> unRegister (serviceName: Array|String, removeMixins?: boolean): null|Object

Deletes a service named **serviceName** from `Service Locator` and returns it's instance.
The flag **removeMixins** points at the necessity to delete the added mixin properties.

```javascript
ServiceLocator.unRegister('ServiceName', true);
```

> unRegisterAll(removeMixins?: boolean): Object

Deletes all registered services from `Service Locator`, and returns the array of their instances.
The flag **removeMixin** points at the necessity to delete the added properties in the services that will be deleted.

```javascript
ServiceLocator.unRegisterAll(true);
```

> removeAllInstances()

Deletes a services all instances.

```javascript
ServiceLocator.removeAllInstances();
```

## Example

###Creating a new instance:

####In runtime environment like node.js or io.js

```javascript
var ServiceLocator = require("servicelocatorjs");
```

####In the browser:

```javascript
var ServiceLocator = window.ServiceLocator;
```

####Print debug information in console

```javascript
ServiceLocator.printLog(true);
```

####Create mixin for services

```javascript
var mixin = {
	/**
	 * Set in service object new property <_state> for further use
	 * @param {*} value
	 */
	setState: function (value) {
		this._state = value;
	},
	/**
	 * Get <_state> property from service object
	 * @return {*}
	 */
	getState: function () {
		return '_state' in this ? this._state : undefined;
	},
	/**
	 * Get service object name
	 * @return {String}
	 */
	getName: function () {
		return 'name' in this ? this.name : 'Service has no name!';
	}
};
```

####Set it for ServiceLocator

```javascript
ServiceLocator.setMixin(mixin);
```

####Create constructors for services

```javascript
/** @constructor */
function ServiceOne() {
	this.name = 'ServiceOne'; // This property is not required. Made for example
}

/** @constructor */
function ServiceTwo() {
	this.name = 'ServiceTwo';
	this.serviceFunction = function () {
		return 'Service number two function';
	};
}
/**
 * @param {*=} data
 * @constructor
 */
function ServiceThree(data) {
	// Service without <name> property
	this.data = data;
}
/** @constructor */
function ServiceFour() {
	this.name = 'ServiceFour';
}
```

####Registering service objects in "ServiceLocator"

####With instantiation immediately after registration

```javascript
ServiceLocator.register('ServiceOne', ServiceOne, true);
```

In `Service Locator` registry it's instance look like this:

```javascript
{
	__mixins: ["id", "setState", "getState", "getName"]
	getName: function,
	getState: function,
	id: "ServiceOne",
	name: "ServiceOne",
	setState: function
}
```

####With lazy instantiation

```javascript
ServiceLocator.register('ServiceTwo', ServiceTwo, false);
```

No instance but have construction function:

```javascript
{
	creator: function ServiceTwo(),
	name: "ServiceTwo",
	prototype: ServiceTwo
}
```

#### Default immediate registration

```javascript
ServiceLocator.register('ServiceThree', ServiceThree, true, [
	{mydata: "example information"}]);
```

```javascript
ServiceLocator.get('ServiceThree').data; // {mydata: "example information"}
```

####Create service object by yourself

```javascript
var serviceFour = new ServiceFour;
```

####Inject perilously created service object

```javascript
ServiceLocator.register(serviceFour.name, serviceFour);
// or
ServiceLocator.register('ServiceFour', serviceFour);
```

####Get instance of service

```javascript
var ONE = ServiceLocator.get('ServiceOne');
```

####Call mixin method

```javascript
ONE.getName(); // "ServiceOne"
```

####Call another one mixin method

```javascript
ONE.setState("launched");
```

####Now call mixin directly from "ServiceLocator"

```javascript
ServiceLocator.get('ServiceOne').getState(); // "launched"
```

####Service number three have mixin but have no property "name"

```javascript
ServiceLocator.get('ServiceThree').getName(); // → "Service has no name!"
```

####Get currently instantiated services

```javascript
ServiceLocator.getAllInstantiate();
// ["ServiceOne", "ServiceThree", "ServiceFour"]
```

#### Instantiate all service objects but "ServiceTwo"

```javascript
ServiceLocator.instantiateAll(function (serviceName) {
	if (serviceName === 'ServiceTwo') {
		return false;
	} else {
		return true;
	}
});
```

####Now without exceptions

```javascript
ServiceLocator.instantiateAll(); // → "Instantiate: ServiceTwo"
```

####Get currently instantiated services

```javascript
ServiceLocator.getAllInstantiate(); // ["ServiceOne", "ServiceTwo", "ServiceThree", "ServiceFour"]
```

###Register multiple service objects

Current state of registry inside `Service Locator`:

```javascript
{
	"ServiceFour":  ▸Object
	"ServiceOne":   ▸Object
	"ServiceThree": ▸Object
	"ServiceTwo":   ▸Object
}
```

####Previosly set state

```javascript
ServiceLocator.get('ServiceOne').getState(); // "launched"
```

####Remove instance, but keep service. This remove any non-default set data in service object.

```javascript
ServiceLocator.removeInstance('ServiceOne');
```

####"ServiceLocator" will instantiate new instance of service object

```javascript
ServiceLocator.get('ServiceOne').getState(); // undefined
// → "Instantiate: ServiceOne"
```

As you see, previously saved data won't back.

####Deletes a service from "ServiceLocator" and returns it's instance

```javascript
var unRegisteredService = ServiceLocator.unRegister('ServiceFive');
```

```javascript
{
	__mixins: ["id", "setState", "getState", "getName"],
	id:       "ServiceFive",
	getState: ▸Function,
	prop:     ▸Array,
	setState: ▸Function,
}
```

####Same as above, but without mixins

```javascript
var unRegisteredServiceWithoutMixin = ServiceLocator.unRegister('ServiceFive', true);
```

Any mentions was removed so:

```javascript
ServiceLocator.get('ServiceFive'); // null
// → "Service is not registered: ServiceFive"
```

####Delete all registered services from "ServiceLocator", and return array of their instances

```javascript
ServiceLocator.unRegisterAll();
```

```javascript
{
	"ServiceFive":  ▸Object,
	"ServiceFour":  ▸Object,
	"ServiceOne":   ▸Object,
	"ServiceSix":   ▸Object,
	"ServiceThree": ▸Object,
	"ServiceTwo":   ▸Object,
}
```

####Same as above, but returned objects have their mixins removed

```javascript
ServiceLocator.unRegisterAll(true);
```
