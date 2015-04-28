(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return (root.ServiceLocator = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = (root.ServiceLocator = factory());
  } else {
    root.ServiceLocator = factory();
  }
}(this, function () {
  'use strict';
  var serviceLocator;

  /**
   * Service locator
   * @class ServiceLocator
   * @constructor
   * @version 1.0.2
   */
  function ServiceLocator() {
    /**
     * Wrapper object for services
     * @type {Object}
     * @private
     */
    var servicesWrap = {};
    /**
     * Set of mixins which have to contain all services registered
     * @type {Object}
     * @private
     */
    var serviceMixin = {};
    /**
     * Print log
     * @type {boolean}
     * @private
     */
    var printLog = false;

    /**
     * Add mixins to object. Extends with <__mixins> parameter.
     * @param {Object} object
     * @param {...*}
     * @example mix(objectToAddMixin, {id: 12345}, {serviceMixin: function () {}});
     */
    function mix(object/*, ...mixins*/) {
      var mixins = Array.prototype.slice.call(arguments, 1), key, index;
      object.__mixins = [];
      for (index = 0; index < mixins.length; ++index) {
        for (key in mixins[index]) {
          if (object[key] === undefined) {
            object[key] = mixins[index][key];
            object.__mixins.push(key);
          }
        }
      }
    }

    /**
     * Invoke new object
     * @param {Function} Constructor
     * @param {Object} mixin
     * @param {Array=} args
     * @return {Object}
     */
    function invoke(Constructor, mixin, args) {
      var instance;

      function Temp(mixins) {
        var index, key;
        if (!mixins) {
          return this;
        }
        this.__mixins = [];
        for (index = 0; index < mixins.length; ++index) {
          for (key in mixins[index]) {
            this[key] = mixin[index][key];
            this.__mixins.push(key);
          }
        }
      }

      Temp.prototype = Constructor.prototype;
      Constructor.prototype = new Temp(mixin);
      instance = new Constructor(args);
      Constructor.prototype = Temp.prototype;
      return instance;
    }

    /**
     * Remove properties from object
     * @param {Object} object
     * @param {Object} propertyList
     */
    function deleteProperty(object, propertyList) {
      var index;
      if (!object || propertyList.recursion > 1000) {
        return;
      }
      propertyList.recursion++;
      if (object.hasOwnProperty('__mixins')) {
        for (index = 0; index < propertyList.length; index += 1) {
          delete object[propertyList[index]];
        }
        delete object.__mixins;
      } else {
        deleteProperty(Object.getPrototypeOf(object), propertyList);
      }
    }

    /**
     * Remove <__mixins> from object
     * @param {Object} object
     * @return {Object}
     */
    function unmix(object) {
      object.__mixins.recursion = 0;
      deleteProperty(object, object.__mixins);
      return object;
    }

    /**
     * Instantiate <service>
     * @param {String} serviceName
     * @return {Object}
     */
    function serviceInvoke(serviceName) {
      printLog && console.log('Instantiate: ' + serviceName);
      servicesWrap[serviceName].instance = invoke(
        servicesWrap[serviceName].creator,
        [{id: serviceName}, serviceMixin],
        servicesWrap[serviceName].args || []
      );
      return servicesWrap[serviceName].instance;
    }

    /**
     * Create new object with defined prototype
     * @param {Object} object
     * @param {*} prototype
     * @return {Object}
     */
    function setPrototypeOf(object, prototype) {
      var constructor = function () {
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            (function (key) {
              Object.defineProperty(this, key, {
                get: function () {
                  return object[key];
                },
                set: function (value) {
                  object[key] = value;
                },
                enumerable: true
              });
            }).call(this, key);
          }
        }
      };
      constructor.prototype = prototype;
      return new constructor;
    }

    /**
     * Create new object with constructor parameters as array
     * @param {Function} constructorFunction
     * @param {Array=} constructorArguments
     * @return {Object}
     */
    function construct(constructorFunction, constructorArguments) {
      Array.isArray(constructorArguments) || (constructorArguments = []);
      return setPrototypeOf(new function () {
        this.prototype = constructorFunction.prototype;
        return constructorFunction.apply(this, constructorArguments);
      }, constructorFunction.prototype);
    }

    return {
      /**
       * Takes true/false values as a parameter.
       * When true, writes information about events and channels into the browser console.
       * @param {boolean=} flag - default is false
       * @return {Object}
       * @public
       */
      printLog: function (flag) {
        printLog = !!flag;
        return this;
      },
      /**
       * Takes an object as a parameter. The object contains a set of additional properties and/or methods,
       * which have to contain all objects registered in <ServiceLocator>.
       * @param {Object} objectWithMixins
       * @return {Object}
       * @public
       */
      setMixin: function (objectWithMixins) {
        serviceMixin = objectWithMixins;
        return this;
      },
      /**
       * Registers an object <serviceObject> under the name <serviceName>. The flag <instantiate> shows,
       * whether lazy instantiation is required to request the object from <ServiceLocator>.
       * By default instantiate is <true>.
       * @param {String} serviceName
       * @param {Function|Object} serviceObject
       * @param {boolean=} instantiate - default is true
       * @param {Array=} constructorArguments
       * @return {boolean}
       * @public
       */
      register: function (serviceName, serviceObject, instantiate, constructorArguments) {
        if (!serviceObject) {
          printLog && console.warn('serviceObject argument is empty: ' + serviceName);
          return false;
        }
        if (servicesWrap[serviceName]) {
          printLog && console.warn('You try to register already registered module: ' + serviceName);
          return false;
        }
        instantiate = arguments.length < 3 ? true : !!instantiate;
        var result;
        switch (typeof serviceObject) {
          case 'function':
            servicesWrap[serviceName] = {
              creator: serviceObject
            };
            if (Array.isArray(constructorArguments) && constructorArguments.length) {
              servicesWrap[serviceName].args = constructorArguments;
            }
            if (instantiate) {
              var service;
              if (servicesWrap[serviceName].args) {
                service = construct(serviceObject, constructorArguments);
              } else {
                service = new serviceObject;
              }
              mix(service, {id: serviceName}, serviceMixin);
              servicesWrap[serviceName].instance = service;
            }
            result = true;
            break;
          case 'object':
            mix(serviceObject, {id: serviceName}, serviceMixin);
            servicesWrap[serviceName] = {
              instance: serviceObject
            };
            result = true;
            break;
          default:
            printLog && console.warn('Service is\'t a function nor object: ' + serviceName);
            result = false;
            break;
        }
        return result;
      },
      /**
       * Calls the <register> function for each element of <arrayOfServices>.
       * Each element of the array must contain one of the <ID> or <id> properties for defining the object name,
       * and service/object/creator for defining the object under registration.
       * There is optional <instantiate>.
       * @param {Array<Object>} arrayOfServices
       * @return {Array}
       * @public
       */
      registerAll: function (arrayOfServices) {
        if (!Array.isArray(arrayOfServices) && !arrayOfServices.length) {
          return [];
        }
        var index, service, serviceName, serviceObject, instantiate, registered = [];
        for (index = 0; index < arrayOfServices.length; ++index) {
          service = arrayOfServices[index];
          serviceName = service['ID'] || service['id'] || service['Id'];
          serviceObject = service['service'] || service['object'] || service['creator'];
          instantiate = (service['instantiate'] !== undefined) ? !!service['instantiate'] : true;
          if (this.register(serviceName, serviceObject, instantiate)) {
            registered.push(serviceName);
          }
        }
        return registered;
      },
      /**
       * Returns the instance of a registered object with an indicated <serviceName> or creates a new one in the case of
       * lazy instantiation.
       * @param {String} serviceName
       * @return {null|Object}
       * @public
       */
      get: function (serviceName) {
        if (servicesWrap[serviceName] === undefined) {
          printLog && console.warn('Service is not registered: ' + serviceName);
          return null;
        }
        if ('instance' in servicesWrap[serviceName] && servicesWrap[serviceName].instance) {
          return servicesWrap[serviceName].instance;
        }
        return serviceInvoke(serviceName);
      },
      /**
       * Instantiates and returns all registered objects. Can take the <filter> function as an argument.
       * The <filter> function must return the logical value. In case filter is predefined,
       * only the services that underwent the check will be instantiated.
       * @param {Function=} filter
       * @return {Array}
       * @public
       */
      instantiateAll: function (filter) {
        var serviceName, result = [];
        if (typeof filter !== 'function') {
          filter = function () {
            return true;
          };
        }
        for (serviceName in servicesWrap) {
          if (
            servicesWrap.hasOwnProperty(serviceName) &&
            servicesWrap[serviceName].creator && !servicesWrap[serviceName].instance &&
            filter(serviceName)
          ) {
            result.push(serviceInvoke(serviceName));
          }
        }
        return result;
      },
      /**
       * Returns the array of instantiated service objects.
       * @return {Array<String>}
       * @public
       */
      getAllInstantiate: function () {
        var serviceName, result = [];
        for (serviceName in servicesWrap) {
          if (serviceName in servicesWrap && servicesWrap[serviceName].instance) {
            result.push(serviceName);
          }
        }
        return result;
      },
      /**
       * Deletes a service <instance> with an indicated <serviceName>.
       * Returns <false> in case the service with the indicated <serviceName> is not found or has no <instance>.
       * This do not remove service itself, only instances of it.
       * @param {String} serviceName
       * @return {boolean}
       * @public
       */
      removeInstance: function (serviceName) {
        if (!servicesWrap[serviceName] || !servicesWrap[serviceName].instance) {
          return false;
        }
        delete servicesWrap[serviceName].instance;
        return true;
      },
      /**
       * Deletes a service named <serviceName> from <ServiceLocator> and returns it's instance.
       * The flag <removeMixins> points at the necessity to delete the added mixin properties.
       * @param {Array|String} serviceName
       * @param {boolean=} removeMixins - default is false
       * @return {null|Object}
       * @public
       */
      unregister: function (serviceName, removeMixins) {
        var result, index;

        function remove(id) {
          var serviceObject, instance;
          if (!(id in servicesWrap)) {
            return null;
          }
          serviceObject = servicesWrap[id];
          if (removeMixins && serviceObject.instance) {
            instance = unmix(serviceObject.instance);
          } else if (serviceObject.instance) {
            instance = serviceObject.instance;
          } else {
            instance = null;
          }
          delete servicesWrap[id];
          return instance;
        }

        if (Object.prototype.toString.call(serviceName) === '[object Array]') {
          result = [];
          for (index = serviceName.length - 1; index > -1; index--) {
            result.push(remove(serviceName[index]));
          }
        } else {
          result = remove(serviceName);
        }
        return result;
      },
      /**
       * Deletes all registered services from <ServiceLocator>, and returns the array of their instances.
       * The flag <removeMixin> points at the necessity to delete the added properties in the services
       * that will be deleted.
       * @param {boolean=} removeMixins - default is false
       * @return {Object<Object>}
       * @public
       */
      unregisterAll: function (removeMixins) {
        var id, result = {}, instance;
        for (id in servicesWrap) {
          if (servicesWrap.hasOwnProperty(id)) {
            instance = this.unregister(id, removeMixins);
            if (instance) {
              result[id] = instance;
            }
          }
        }
        return result;
      }
    };
  }

  serviceLocator = new ServiceLocator();
  /**
   * @type {ServiceLocator}
   * @public
   */
  serviceLocator.Constructor = ServiceLocator;
  return serviceLocator;
}));
