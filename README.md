Service Locator
===========

Implementation of dependency injection approach using `Service Locator` pattern.

`Service Locator` is dependency injection pattern. The `Service Locator` pattern does not describe how to instantiate the services. It describes a way to register **services** and **locate** them in a global point of access. A `Service Locator` should be able to locate a **service** using a central **registry** without knowing its concrete type. For example, it might use a string key which on request returns the object depending on code initialization. This allows you to replace the concrete implementation of the dependency without modifying the objects.

Advantages:

* option of adding extra attributes and methods using **mixin** pattern to all objects registered in Service Locator;
* option of **lazy instantiation**;
* unregistering instances;
* unregistering objects;
* applications can optimize themselves at run-time by selectively adding and removing items from the `Service Locator`;
* large sections of a library or application can be completely separated, the only link between them becomes the **registry**;
* solves the drawback of factories allows to manage the creation of objects automatically and centrally;

Disvantages:

* your classes have an extra dependency on the `Service Locator`;
* you have to write additional code to add **service references** to the locator before your service objects use it;
* objects placed in the **registry** are black boxed, this makes it harder to detect and recover from their errors, and may make the system as a whole less reliable;
* sometimes **registry** can be a security vulnerability, because it allows outsiders to inject code into an application;
* the source code has added complexity, this makes the source code more difficult to understand;
* the registry hides the object dependencies, causing errors when dependencies are missing;
* the **registry** makes code harder to test, since all tests need to interact with the same global `Service Locator` to set the fake dependencies of a service object under test;

## Dependencies

None.

## Methods

#### printLog
```javascript
printLog(flag);
```

Takes **true/false** values as a parameter. When **true**, writes information about events and channels into the browser console. 

#### setMixin
```javascript
setMixin(obj);
```

Takes an object as a parameter. The object contains a set of additional properties and/or methods, which have to contain all objects registered in Service Locator.

#### getLocator
```javascript
getLocator();
```

Returns the container that has all the objects registered in Service Locator.

#### register
```javascript
register(value, obj, instantiate);
```

Registers an object **obj** under the name **value**. The flag **instantiate** shows, whether lazy instantiation is required to request the object from `Service Locator`. By default **instantiate** is **true**.

#### registerAll
```javascript
registerAll(arrayOfServices);
```

Calls the **register** function for each element of **arrayOfServices**. Each element of the input array must contain one of the **radID**/**ID**/**id** properties for defining the object name, and **service**/**obj**/**object**/**creator** for defining the object under registration. There is optional **instantiate**.

#### get
```javascript
get(id);
```

Returns the instance of a registered object with an indicated **id** or creates a new one in the case of lazy instantiation.

#### instantiateAll
```javascript
instantiateAll(filter)
```

Instantiates and returns all registered objects. Can take the **filter** function as an argument. The **filter** function must return the logical value. In case **filter** is predefined, only the services that underwent the check will be instantiated. 

#### getAllInstantiate
```javascript
getAllInstantiate(withConstructor)
```

Returns the array of instantiated objects.

#### removeInstance
```javascript
removeInstance(id)
```

Deletes a service instance with an indicated **id**. Returns **false** in case the service with the indicated **id** is not found or has no instance.

#### unregister
```javascript
unregister(value, removeMixin)
```

Deletes a service named **value** from Service Locator and returns its instance. The flag **removeMixin** points at the necessity to delete the added properties.

#### unregisterAll
```javascript
unregisterAll(removeMixins)
```

Deletes all registered services from `Service Locator`, and returns the array of their instances. The flag **removeMixin** points at the necessity to delete the added properties in the services that will be deleted.

## Examples

###Creating a new instance:

In runtime environment like Node.js.

```javascript
var serviceLocator = require("ServiceLocator");
```
In the browser:

```javascript
var serviceLocator = window.ServiceLocator;
```

###Make another service locator:

```javascript
var AnotherServiceLocator = new ServiceLocator.Constructor;
```

###Initialize constructor for multiple instances:

```javascript
var ConstructorServiceLocator = require("ServiceLocator").Constructor;
var serviceLocator = new ConstructorServiceLocator();
```

###Log module actions:

```javascript
serviceLocator.printLog(true);
```

###Define and register services:

```javascript
var ServiceOne = function ServiceOne() {
	this.name = 'ServiceOne';
	this.resolve = function Resolve () {
		return 'Service number one resolve result';
	};
};
var ServiceTwo = function ServiceTwo() {
	this.name = 'ServiceTwo';
	this.resolve = function Resolve () {
		return 'Service number two resolve result';
	};
};
serviceLocator.register(ServiceOne.name, ServiceOne);
serviceLocator.register(ServiceTwo.name, ServiceTwo);
```

###Instantiates and returns all registered service objects:

```javascript
serviceLocator.instantiateAll();
// Instantiate: ServiceOne
// Instantiate: ServiceTwo
```

###Returns the array of instantiated service objects:

```javascript
var instantiatedServices = serviceLocator.getAllInstantiate();
console.dir(instantiatedServices); // ['ServiceOne', 'ServiceTwo']
```

###Get instance of registered object:

```javascript
var sOne = serviceLocator.get(ServiceOne.name); // { name: 'ServiceOne', resolve: [Function: Resolve] }
var result = sOne.resolve(); // 'Service number one resolve result'
```

###Working with unregistered service objects:

```javascript
serviceLocator.get("ServiceThree"); // 'Service is not registered: ServiceThree'
serviceLocator.unregister(ServiceOne.name);
serviceLocator.get(ServiceOne.name); // null
serviceLocator.getAllInstantiate(); // [ 'ServiceTwo' ]
```

##License

The MIT License (MIT)

Copyright (c) 2015 [Mobidev](http://mobidev.biz/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.