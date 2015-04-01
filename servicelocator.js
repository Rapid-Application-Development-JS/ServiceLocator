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
   * @class Servicelocator
   * @constructor
   * @version 1.0.0
   */
  function ServiceLocator() {
    var servicesWrap = {}, serviceMixin, debug = false;

    function log() {
      if (debug) {
        console.log.apply(console, arguments);
      }
    }

    function mix(object) {
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

    function invoke(Constructor, mixin, args) {
      var instance;

      function Temp(mixins) {
        var index, key;
        if (!mixins) return this;
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

    function deleteProperty(object, propertyList) {
      var index;
      if (!object || propertyList.recursion > 1000) {
        return;
      }
      propertyList.recursion += 1;
      if (object.hasOwnProperty('__mixins')) {
        for (index = 0; index < propertyList.length; index++) {
          delete object[propertyList[index]];
        }
        delete object.__mixins;
      } else {
        deleteProperty(Object.getPrototypeOf(object), propertyList);
      }
    }

    function unmix(object) {
      object.__mixins.recursion = 0;
      deleteProperty(object, object.__mixins);
      return object;
    }

    function createObj(serviceName) {
      log('Instantiate: ' + serviceName);
      return servicesWrap[serviceName].instance =
        invoke(servicesWrap[serviceName].creator, [{id: serviceName}, serviceMixin]);
    }

    return {
      /**
       * Takes true/false values as a parameter.
       * When true, writes information about events and channels into the browser console.
       * @param {boolean=false} flag
       * @return {Object}
       */
      printLog: function (flag) {
        debug = !!flag;
        return this;
      },
      /**
       * Takes an object as a parameter. The object contains a set of additional properties and/or methods,
       * which have to contain all objects registered in Service Locator.
       * @param {Object} object
       * @return {Object}
       */
      setMixin: function (object) {
        serviceMixin = object;
        return this;
      },
      /**
       * Returns the container that has all the objects registered in Service Locator.
       * @return {Object}
       */
      getLocator: function () {
        return servicesWrap;
      },
      /**
       * Registers an object `obj` under the name value. The flag instantiate shows,
       * whether lazy instantiation is required to request the object from Service Locator.
       * By default instantiate is true.
       * @param {Object|String} serviceName
       * @param {Object} serviceObject
       * @param {boolean=true} instantiate
       * @return {Object}
       */
      register: function (serviceName, serviceObject, instantiate) {
        function track(id) {
          if (servicesWrap[id] === undefined) {
            if (typeof serviceObject === 'function' && (instantiate === true || instantiate === undefined)) {
              servicesWrap[id] = {
                creator: serviceObject
              };
            } else {
              mix(obj, {id: id}, serviceMixin);
              servicesWrap[id] = {
                instance: serviceObject
              };
            }
          } else {
            log('You try register already registered module:' + id + '!');
          }
        }

        if (Object.prototype.toString.call(serviceName) === '[object Array]') {
          for (var index = serviceName.length - 1; index > -1; index--) {
            track(serviceName[index]);
          }
        } else {
          track(serviceName);
        }
        return this;
      },
      /**
       * Calls the register function for each element of `arrayOfServices`.
       * Each element of the input array must contain one of the ID or id properties for defining the object name,
       * and service/obj/object/creator for defining the object under registration. There is optional instantiate.
       * @param {Array} arrayOfServices
       * @return {Object}
       */
      registerAll: function (arrayOfServices) {
        var index, service, serviceName, object, instantiate;
        for (index = 0; index < arrayOfServices.length; ++index) {
          service = arrayOfServices[index];
          serviceName = service.ID || service.id;
          object = service.service || service.obj || service.object || service.creator;
          instantiate = (service.instantiate !== undefined) ? !!service.instantiate : true;
          this.register(serviceName, object, instantiate);
        }
        return this;
      },
      /**
       * Returns the instance of a registered object with an indicated id or creates a new one in the case of
       * lazy instantiation.
       * @param {String} serviceName
       * @return {Object}
       */
      get: function (serviceName) {
        if (servicesWrap[serviceName] === undefined) {
          log('Service is not registered: ' + serviceName);
          return null;
        }
        return servicesWrap[serviceName].instance || createObj(serviceName);
      },
      /**
       * Instantiates and returns all registered objects. Can take the `filter` function as an argument.
       * The filter function must return the logical value. In case filter is predefined,
       * only the services that underwent the check will be instantiated.
       * @param {Function=} filter
       * @return {Array}
       */
      instantiateAll: function (filter) {
        var serviceName, result = [];
        filter = filter || function () {
          return true;
        };
        for (serviceName in servicesWrap) {
          if (
            servicesWrap.hasOwnProperty(serviceName) &&
            servicesWrap[serviceName].creator && !servicesWrap[serviceName].instance &&
            filter(serviceName)
          ) {
            result.push(createObj(serviceName));
          }
        }
        return result;
      },
      /**
       * Returns the array of instantiated objects.
       * @param {boolean=false} withConstructor
       * @return {Array}
       */
      getAllInstantiate: function (withConstructor) {
        var serviceName, result = [], flag;
        for (serviceName in servicesWrap) {
          flag = (withConstructor) ? !!servicesWrap[serviceName].creator : true;
          if (
            servicesWrap.hasOwnProperty(serviceName) &&
            servicesWrap[serviceName].instance &&
            servicesWrap[serviceName].creator
          ) {
            result.push(serviceName);
          }
        }
        return result;
      },
      /**
       * Deletes a service instance with an indicated id.
       * Returns false in case the service with the indicated id is not found or has no instance.
       * @param {String} serviceName
       * @return {boolean}
       */
      removeInstance: function (serviceName) {
        if (!servicesWrap[serviceName] || !servicesWrap[serviceName].instance) {
          return false;
        }
        delete servicesWrap[serviceName].instance;
      },
      /**
       * Deletes a service named value from Service Locator and returns its instance.
       * The flag `removeMixin` points at the necessity to delete the added properties.
       * @param {Object|String} servieName
       * @param {boolean=false} removeMixin
       * @return {Object}
       */
      unregister: function (servieName, removeMixin) {
        var result, index;

        function remove(id) {
          var serviceData, instance;
          serviceData = servicesWrap[id];
          if (removeMixin && serviceData && serviceData.instance) {
            instance = serviceData.instance;
            unmix(instance);
          }
          delete servicesWrap[id];
          return serviceData.instance;
        }

        if (Object.prototype.toString.call(servieName) === '[object Array]') {
          result = [];
          for (index = servieName.length - 1; index > -1; index--) {
            result.push(remove(servieName[index]));
          }
        } else {
          result = remove(servieName);
        }
        return result;
      },
      /**
       * Deletes all registered services from Service Locator, and returns the array of their instances.
       * The flag `removeMixin` points at the necessity to delete the added properties in the services
       * that will be deleted.
       * @param {boolean=false} removeMixins
       * @return {Array}
       */
      unregisterAll: function (removeMixins) {
        var id, result = [], instance;
        for (id in servicesWrap) {
          if (servicesWrap.hasOwnProperty(id)) {
            instance = this.unregister(id, removeMixins);
            if (instance) result.push(instance);
          }
        }
        return result;
      }
    };
  }

  serviceLocator = new ServiceLocator();
  serviceLocator.Constructor = ServiceLocator;
  return serviceLocator;
}));