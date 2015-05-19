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
   * @param {String} mixinsPropertyName
   * @constructor
   */
  function ServiceLocator(mixinsPropertyName) {
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
     * Mixins name
     * @private
     */
    var mixName = isString(mixinsPropertyName) ? mixinsPropertyName : '__mixins';

    /**
     * Add mixins to object. Extends with mixins parameter.
     * @param {Object} object
     * @param {...*}
     * @example mix(objectToAddMixin, {id: 12345}, {serviceMixin: function () {}});
     */
    function mix(object/*, ...mixins*/) {
      var mixins = Array.prototype.slice.call(arguments, 1), key, index;
      object[mixName] = [];
      for (index = 0; index < mixins.length; ++index) {
        for (key in mixins[index]) {
          if (object[key] === undefined) {
            object[key] = mixins[index][key];
            object[mixName].push(key);
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
        this[mixName] = [];
        for (index = 0; index < mixins.length; ++index) {
          for (key in mixins[index]) {
            this[key] = mixin[index][key];
            this[mixName].push(key);
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
      if (object.hasOwnProperty(mixName)) {
        for (index = 0; index < propertyList.length; index += 1) {
          delete object[propertyList[index]];
        }
        delete object[mixName];
      } else {
        deleteProperty(Object.getPrototypeOf(object), propertyList);
      }
    }

    /**
     * Remove mixins from object
     * @param {Object} object
     * @return {Object}
     */
    function unMix(object) {
      object[mixName].recursion = 0;
      deleteProperty(object, object[mixName]);
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
     * Get variable type
     * @param {*} variable
     * @return {String}
     * @private
     * @since 1.0.3
     */
    function varType(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    /**
     * Checks if `value` is object-like.
     * @param {*} variable
     * @return {boolean}
     * @private
     * @since 1.0.3
     */
    function isObject(variable) {
      return varType(variable) === 'object';
    }

    /**
     * Checks if `value` is string.
     * @param {*} variable
     * @return {boolean}
     * @private
     * @since 1.0.3
     */
    function isString(variable) {
      return typeof variable === 'string';
    }

    /**
     * Checks if `value` is function.
     * @param {*} variable
     * @return {boolean}
     * @private
     * @since 1.0.3
     */
    function isFunction(variable) {
      return typeof variable === 'function';
    }

    /**
     * Service had constructor function
     * @param {String} serviceName
     * @return {boolean}
     * @private
     * @since 1.0.3
     */
    function serviceHasCreator(serviceName) {
      if (!scope.isRegistered(serviceName)) {
        return false;
      }
      return 'creator' in servicesWrap[serviceName];
    }

    var scope = {
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
        if (isObject(objectWithMixins)) {
          serviceMixin = objectWithMixins;
        }
        return this;
      },
      /**
       * Return current set mixins
       * @return {Object}
       * @public
       * @since 1.0.3
       */
      getMixin: function () {
        return serviceMixin;
      },
      /**
       * Takes an object as a parameter. The object contains a set of additional properties and/or methods,
       * which have to contain all objects registered in <ServiceLocator>.
       * If no parameters passed, or not an Object, only return current mixins.
       * @param {Object=} objectWithMixins
       * @return {Object}
       * @public
       * @since 1.0.3
       */
      mixin: function (objectWithMixins) {
        this.setMixin(objectWithMixins);
        return this.getMixin();
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
        if (!isString(serviceName) || !serviceName.length) {
          printLog && console.warn('serviceName must be type of string: [' + serviceName + ']');
          return false;
        }
        if (!isFunction(serviceObject) && !isObject(serviceObject)) {
          printLog && console.warn('serviceObject argument is empty or have wrong type: [' + serviceObject + ']');
          return false;
        }
        if (this.isRegistered(serviceName)) {
          printLog && console.warn('You try to register already registered module: [' + serviceName + ']');
          return false;
        }
        instantiate = arguments.length < 3 ? true : !!instantiate;
        switch (typeof serviceObject) {
          case 'function':
            servicesWrap[serviceName] = {
              creator: serviceObject
            };
            if (arguments.length > 3) {
              servicesWrap[serviceName].args = constructorArguments;
            }
            if (instantiate) {
              var service;
              if ('args' in servicesWrap[serviceName]) {
                service = invoke(serviceObject, {}, servicesWrap[serviceName].args);
              } else {
                service = invoke(serviceObject, {});
              }
              mix(service, {id: serviceName}, serviceMixin);
              servicesWrap[serviceName].instance = service;
            }
            break;
          case 'object':
            mix(serviceObject, {id: serviceName}, serviceMixin);
            servicesWrap[serviceName] = {
              instance: serviceObject
            };
            break;
          default:
            return false;
        }
        return true;
      },
      /**
       * Checks wherever service is registered
       * @param {String} serviceName
       * @return {boolean}
       * @public
       * @since 1.0.3
       */
      isRegistered: function (serviceName) {
        return serviceName in servicesWrap;
      },
      /**
       * Checks wherever service is instantiated
       * @param {String} serviceName
       * @return {boolean}
       * @public
       * @since 1.0.3
       */
      isInstantiated: function (serviceName) {
        if (!this.isRegistered(serviceName)) {
          return false;
        }
        if ('instance' in servicesWrap[serviceName]) {
          return !!servicesWrap[serviceName]['instance'];
        }
        return false;
      },
      /**
       * Returns the instance of a registered object with an indicated <serviceName> or creates a new one in the case of
       * lazy instantiation.
       * @param {String} serviceName
       * @return {null|Object}
       * @public
       */
      get: function (serviceName) {
        if (!this.isRegistered(serviceName)) {
          printLog && console.warn('Service is not registered: ' + serviceName);
          return null;
        }
        if (this.isInstantiated(serviceName)) {
          printLog && console.warn('Already instantiated: ' + serviceName);
          return servicesWrap[serviceName].instance;
        }
        if (serviceHasCreator(serviceName)) {
          return serviceInvoke(serviceName);
        }
        return null;
      },
      /**
       * Instantiate service by name
       * @param {String} serviceName
       * @return {null|Object}
       * @public
       * @since 1.0.3
       */
      instantiate: function (serviceName) {
        if (!this.isRegistered(serviceName)) {
          return false;
        }
        if (this.isInstantiated(serviceName)) {
          return true;
        }
        if (serviceHasCreator(serviceName)) {
          return !!serviceInvoke(serviceName);
        }
        return false;
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
        var name, result = [];
        if (typeof filter !== 'function') {
          filter = function () {
            return true;
          };
        }
        for (name in servicesWrap) {
          if (!this.isInstantiated(name) && serviceHasCreator(name) && filter(name)) {
            result.push(serviceInvoke(name));
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
          if (this.isInstantiated(serviceName)) {
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
       * @param {String} serviceName
       * @param {boolean=} removeMixins - default is false
       * @return {boolean|null|Object}
       * @public
       * @since 1.0.3
       */
      unRegister: function (serviceName, removeMixins) {
        if (!this.isRegistered(serviceName)) {
          return false;
        }
        if (!this.isInstantiated(serviceName)) {
          delete servicesWrap[serviceName];
          return null;
        }
        var instance = null;
        if (removeMixins) {
          instance = unMix(servicesWrap[serviceName].instance);
        } else {
          instance = servicesWrap[serviceName].instance;
        }
        delete servicesWrap[serviceName];
        return instance;
      },
      /**
       * Deletes all registered services from <ServiceLocator>, and returns the array of their instances.
       * The flag <removeMixin> points at the necessity to delete the added properties in the services
       * that will be deleted.
       * @param {boolean=} removeMixins - default is false
       * @return {Object<Object>}
       * @public
       */
      unRegisterAll: function (removeMixins) {
        var serviceName, result = {}, instance;
        for (serviceName in servicesWrap) {
          instance = this.unRegister(serviceName, removeMixins);
          if (instance) {
            result[serviceName] = instance;
          }
        }
        return result;
      }
    };
    return scope;
  }

  serviceLocator = new ServiceLocator();
  /**
   * @type {ServiceLocator}
   * @public
   */
  serviceLocator.Constructor = ServiceLocator;
  return serviceLocator;
}));
