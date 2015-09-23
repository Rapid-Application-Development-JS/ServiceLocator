Service Locator Release Notes
==========================

Version 1.0.4 - Sep 23, 2015
---------------------

#####Compatible changes:

- Additions
	* `getAllRegistered` returns the array of registered service objects
	* `removeAllInstances` deletes a services all instances

- Changed:
	* `getAllInstantiate` now accepts parameter to get array or object

Version 1.0.3 - May 06, 2015
---------------------

#####Compatible changes:

- Additions
	* `isRegistered` checks wherever service is registered
	* `isInstantiated` checks wherever service is instantiated
	* `instantiate` instantiate service by name
	* `getMixin` get mixins from locator
	* `mixin` set and/or return mixins

#####Incompatible changes:

- Changed:
	* `unregister` renamed to `unRegister`
	* `unRegister` takes only string as service name not array

- Removed:
	* `registerAll`


Version 1.0.2 - Apr 28, 2015
---------------------

Rename library files to **servicelocatorjs**

Version 1.0.1 - Apr 23, 2015
---------------------

#####Compatible changes:

- Additions
	* `register` now have fourth argument used as constructor parameters for service

- Changed:
	* `removeInstance` now return _true_ if instance was successfully removed
	* `unregisterAll` now return object with _service name_-_service instance_ structure instead of array of instances

#####Incompatible changes:

- Changed:
	* `register ` now returns boolean result instead of self reference
	* `registerAll` now ignores parameters named _obj_ as constructor function in `arrayOfServices` argument
	* `registerAll` now returns array of string with names of successfully registered services instead of self reference

- Removed:
	* `getLocator`

#####Fixed:

	* `removeInstance` now return _true_ if instance was successfully removed
	* `unregister` now have check if service name was incorrect

#####Roadmap:

	* Write more complex tests

Version 1.0.0 - Apr 1, 2015
---------------------

Initial release.
