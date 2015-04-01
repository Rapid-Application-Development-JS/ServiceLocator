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

    function invoke(Constr, mixin, args) {
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

      Temp.prototype = Constr.prototype;
      Constr.prototype = new Temp(mixin);
      instance = new Constr(args);
      Constr.prototype = Temp.prototype;
      return instance;
    }

    function deleteProp(object, propList) {
      var index;
      if (!object || propList.recursion > 1000) return;
      propList.recursion += 1;
      if (object.hasOwnProperty('__mixins')) {
        for (index = 0; index < propList.length; index++) {
          delete object[propList[index]];
        }
        delete object.__mixins;
      } else {
        deleteProp(Object.getPrototypeOf(object), propList);
      }
    }

    function unmix(object) {
      object.__mixins.recursion = 0;
      deleteProp(object, object.__mixins);
      return object;
    }

    function createObj(id) {
      log('Instantiate: ' + id);
      return servicesWrap[id].instance = invoke(servicesWrap[id].creator, [{radID: id}, serviceMixin]);
    }

    return {
      /**
       * Takes true/false values as a parameter.
       * When true, writes information about events and channels into the browser console.
       * @param {boolean} flag
       * @return {Object}
       */
      printLog: function (flag) {
        debug = !!flag;
        return this;
      },
      /**
       * Takes an object as a parameter. The object contains a set of additional properties and/or methods,
       * which have to contain all objects registered in Service Locator.
       * @param {Object} obj
       * @return {Object}
       */
      setMixin: function (obj) {
        serviceMixin = obj;
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
       * @param {*} value
       * @param {Object} obj
       * @param {boolean=true} instantiate
       * @return {Object}
       */
      register: function (value, obj, instantiate) {
        function track(id) {
          if (servicesWrap[id] === undefined) {
            if (typeof obj === 'function' && (instantiate === true || instantiate === undefined)) {
              servicesWrap[id] = {
                creator: obj
              };
            } else {
              mix(obj, {radID: id}, serviceMixin);
              servicesWrap[id] = {
                instance: obj
              };
            }
          } else {
            log('You try register already registered module:' + id + '!');
          }
        }

        if (Object.prototype.toString.call(value) === '[object Array]') {
          for (var index = value.length - 1; index > -1; index--) {
            track(value[index]);
          }
        } else {
          track(value);
        }
        return this;
      },
      /**
       * Calls the register function for each element of `arrayOfServices`.
       * Each element of the input array must contain one of the radID/ID/id properties for defining the object name,
       * and service/obj/object/creator for defining the object under registration. There is optional instantiate.
       * @param {Array} arrayOfServices
       * @return {Object}
       */
      registerAll: function (arrayOfServices) {
        var index, service, radID, obj, instantiate;
        for (index = 0; index < arrayOfServices.length; ++index) {
          service = arrayOfServices[index];
          radID = service.radID || service.ID || service.id;
          obj = service.service || service.obj || service.object || service.creator;
          instantiate = (service.instantiate !== undefined) ? !!service.instantiate : true;
          this.register(radID, obj, instantiate);
        }
        return this;
      },
      /**
       * Returns the instance of a registered object with an indicated id or creates a new one in the case of
       * lazy instantiation.
       * @param {*} id
       * @return {Object}
       */
      get: function (id) {
        if (servicesWrap[id] === undefined) {
          log('Service is not registered: ' + id);
          return null;
        }
        return servicesWrap[id].instance || createObj(id);
      },
      /**
       * Instantiates and returns all registered objects. Can take the `filter` function as an argument.
       * The filter function must return the logical value. In case filter is predefined,
       * only the services that underwent the check will be instantiated.
       * @param {Function=} filter
       * @return {Array}
       */
      instantiateAll: function (filter) {
        var radID, result = [];
        filter = filter || function () {
          return true;
        };
        for (radID in servicesWrap) {
          if (
              servicesWrap.hasOwnProperty(radID) &&
              servicesWrap[radID].creator &&
              !servicesWrap[radID].instance &&
              filter(radID)
          ) {
            result.push(createObj(radID));
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
        var radID, result = [], flag;
        for (radID in servicesWrap) {
          flag = (withConstructor) ? !!servicesWrap[radID].creator : true;
          if (servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].instance &&
            servicesWrap[radID].creator) {
            result.push(radID);
          }
        }
        return result;
      },
      /**
       * Deletes a service instance with an indicated id.
       * Returns false in case the service with the indicated id is not found or has no instance.
       * @param {*} id
       * @return {boolean}
       */
      removeInstance: function (id) {
        if (!servicesWrap[id] || !servicesWrap[id].instance) {
          return false;
        }
        delete servicesWrap[id].instance;
      },
      /**
       * Deletes a service named value from Service Locator and returns its instance.
       * The flag `removeMixin` points at the necessity to delete the added properties.
       * @param {*} value
       * @param {boolean=false} removeMixin
       * @return {Object}
       */
      unregister: function (value, removeMixin) {
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

        if (Object.prototype.toString.call(value) === '[object Array]') {
          result = [];
          for (index = value.length - 1; index > -1; index--) {
            result.push(remove(value[index]));
          }
        } else {
          result = remove(value);
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
        for (id  in servicesWrap) {
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