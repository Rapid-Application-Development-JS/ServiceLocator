Service Locator Release Notes
==========================

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
