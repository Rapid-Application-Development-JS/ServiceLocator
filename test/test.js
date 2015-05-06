console.log('\033[2J');
//
// < Includes >
//
var ServiceLocator = require('../source/servicelocator.js');
var chai = require('chai');
var assert = chai.assert;
//
// < Config >
//
chai.config.includeStack = true;
chai.config.showDiff = true;
//
// < Utilities >
//
function keys(hash) {
  return Object.keys(hash).sort();
}
function objLength(hash) {
  return keys(hash).length;
}
function merge(array1, array2) {
  return array1.concat(array2).sort();
}
function fresh() {
  locator = new ServiceLocator.Constructor();
}
function pullName(service) {
  return service.name ? service.name : service.constructor.name;
}
//
// < Initialization >
//
var locator = new ServiceLocator.Constructor;
// Create mixin for services
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
// Create constructors for services
/** @constructor */
function ServiceOne() {
  this.name = 'ServiceOne'; // this is not required
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
var serviceFour = new ServiceFour();
var services = [
  ServiceOne,
  ServiceTwo,
  ServiceThree,
  ServiceFour
];
//
// < Tests >
//
describe('Initialization', function () {
  beforeEach(function () {
    fresh();
  });
  it('Include', function () {
    assert.isObject(ServiceLocator,
      'ServiceLocator must be instantiated');
    assert.isFunction(ServiceLocator.Constructor,
      'Constructor must be function');
  });
  it('Instantiate', function () {
    assert.isObject(new ServiceLocator.Constructor,
      'Constructor must create new object');
  });
});
describe('Mixins', function () {
  beforeEach(function () {
    fresh();
  });
  it('setMixin()', function () {
    assert.isObject(locator.setMixin(),
      'No service locator returned');
    assert.lengthOf(keys(locator.getMixin()), 0,
      'Mixins should be empty');
    assert.isObject(locator.setMixin('DUMMY VALUE'));
    assert.lengthOf(keys(locator.getMixin()), 0,
      'Mixins should be empty');
    locator.setMixin(mixin);
    assert.lengthOf(keys(locator.getMixin()), Object.keys(mixin).length,
      'Mixins not installed correctly');
  });
  it('getMixin()', function () {
    assert.isObject(locator.getMixin(),
      'Empty object expected');
    assert.lengthOf(keys(locator.setMixin(mixin).getMixin()), keys(mixin).length,
      'Mixins not installed correctly');
    assert.property(locator.getMixin(), 'setState',
      'Expected parameter not found');
    assert.property(locator.getMixin(), 'getState',
      'Expected parameter not found');
    assert.property(locator.getMixin(), 'getName',
      'Expected parameter not found');
  });
  it('mixin()', function () {
    assert.lengthOf(keys(locator.mixin()), 0,
      'Mixins should be empty');
    assert.isObject(locator.mixin('DUMMY VALUE'));
    assert.lengthOf(keys(locator.mixin()), 0,
      'Mixins should be empty');
    locator.mixin(mixin);
    assert.lengthOf(keys(locator.mixin()), objLength(mixin),
      'Mixins not installed correctly');
    assert.property(locator.mixin(), 'setState',
      'Expected parameter not found');
    assert.property(locator.mixin(), 'getState',
      'Expected parameter not found');
    assert.property(locator.mixin(), 'getName',
      'Expected parameter not found');
  });
});
describe('Services', function () {
  beforeEach(function () {
    fresh();
  });
  describe('Registration', function () {
    beforeEach(function () {
      fresh();
    });
    it('register() - no arguments', function () {
      assert.isFalse(locator.register(),
        'No parameters at all. Result must be falsy');
    });
    it('register() - wrong arguments', function () {
      assert.isFalse(locator.register(1, new Function),
        'Service name must be string only. Result must be falsy');
      assert.isFalse(locator.register('serviceName', ''),
        'Service object must be function or object. Result must be falsy');
    });
    it('register(name, ConstructorFunction) - pass name and constructor function', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne),
        'Service registration failed');
      assert.isFalse(locator.register(ServiceOne.name),
        'Successful registration of already registered module');
      assert.include(locator.getAllInstantiate(), ServiceOne.name,
        'Service not included');
      assert.isTrue(locator.isRegistered(ServiceOne.name),
        'Service not registered correctly');
      assert.isTrue(locator.isInstantiated(ServiceOne.name),
        'Service not instantiated');
    });
    it('register(name, object) - pass name and object', function () {
      assert.isTrue(locator.register(ServiceFour.name + '_1', serviceFour),
        'Prepared object not registered');
      assert.isTrue(locator.isInstantiated(serviceFour.name + '_1'),
        'Pass prepared object. Must be instantiated');
      assert.isTrue(locator.register(ServiceFour.name + '_2', serviceFour, false),
        'Prepared object not registered');
      assert.isTrue(locator.isInstantiated(serviceFour.name + '_2'),
        'Pass prepared object. Must be instantiated');
    });
    it('register(serviceName, ConstructorFunction, boolFalse, argumentValue)', function () {
      assert.isTrue(locator.register(ServiceThree.name, ServiceThree, false, 'argValue1'),
        'Service registration failed');
      assert.isFalse(locator.isInstantiated(ServiceThree.name),
        'Service is instantiated');
      assert.isTrue(locator.instantiate(ServiceThree.name),
        'Waiting for object from instance');
      assert.property(locator.get(ServiceThree.name), 'data',
        'Service should have data property');
      assert.isString(locator.get(ServiceThree.name).data,
        'Service parameter should be string');
      assert.equal(locator.get(ServiceThree.name).data, 'argValue1',
        'Service value is different');
    });
    it('register(serviceName, ConstructorFunction, boolTrue, argumentValue)', function () {
      assert.isTrue(locator.register(ServiceThree.name, ServiceThree, true, 'argValue1'),
        'Service registration failed');
      assert.isTrue(locator.isInstantiated(ServiceThree.name),
        'Service is instantiated');
      assert.property(locator.get(ServiceThree.name), 'data',
        'Service should have data property');
      assert.isString(locator.get(ServiceThree.name).data,
        'Service parameter should be string');
      assert.equal(locator.get(ServiceThree.name).data, 'argValue1',
        'Service value is different');
    });
  });
  describe('Get service instance', function () {
    beforeEach(function () {
      fresh();
    });
    it('get() - without arguments in registration', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne),
        'Service registration failed');
      assert.isObject(locator.get(ServiceOne.name),
        'Service not instantiated');
      assert.deepEqual(locator.get(ServiceOne.name), {__mixins: ['id'], id: 'ServiceOne', name: 'ServiceOne'},
        'Expected different service structure');
    });
    it('get() - with instantiation in registration', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, true),
        'Service registration failed');
      assert.isObject(locator.get(ServiceOne.name),
        'Service not instantiated');
      assert.deepEqual(locator.get(ServiceOne.name), {__mixins: ['id'], id: 'ServiceOne', name: 'ServiceOne'},
        'Expected different service structure');
    });
    it('get() - with lazy instantiation in registration', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, false),
        'Service registration failed');
      assert.isObject(locator.get(ServiceOne.name),
        'Service not instantiated');
      assert.deepEqual(locator.get(ServiceOne.name), {__mixins: ['id'], id: 'ServiceOne', name: 'ServiceOne'},
        'Expected different service structure');
    });
  });
  describe('Instance manipulation', function () {
    beforeEach(function () {
      fresh();
    });
    it('instantiate()', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne),
        'Service registration failed');
      assert.isFalse(locator.instantiate(),
        'No argument passed');
      assert.isFalse(locator.instantiate(ServiceTwo.name),
        'Successful instantiation of unregistered service');
      assert.isTrue(locator.instantiate(ServiceOne.name),
        'Expect instance');
    });
    it('instantiateAll() - no filter', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, false),
        'Service registration failed: ' + ServiceOne.name);
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, false),
        'Service registration failed: ' + ServiceTwo.name);
      assert.isTrue(locator.register(ServiceThree.name, ServiceThree, false),
        'Service registration failed: ' + ServiceThree.name);
      assert.isTrue(locator.register(ServiceFour.name, ServiceFour, false),
        'Service registration failed: ' + ServiceFour.name);
      assert.lengthOf(locator.getAllInstantiate(), 0,
        'No services should be instantiated');
      assert.lengthOf(locator.instantiateAll(), 4,
        'Not instantiated correctly');
    });
    it('instantiateAll() - with filter', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, false),
        'Service registration failed: ' + ServiceOne.name);
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, false),
        'Service registration failed: ' + ServiceTwo.name);
      assert.isTrue(locator.register(ServiceThree.name, ServiceThree, false),
        'Service registration failed: ' + ServiceThree.name);
      assert.isTrue(locator.register(ServiceFour.name, ServiceFour, false),
        'Service registration failed: ' + ServiceFour.name);
      assert.lengthOf(locator.getAllInstantiate(), 0,
        'No services should be instantiated');
      assert.lengthOf(locator.instantiateAll(function () {
        return false;
      }), 0, 'Not instantiated correctly');
      assert.lengthOf(locator.instantiateAll(function (serviceName) {
        return !!((serviceName === ServiceOne.name) || (serviceName === ServiceTwo.name));
      }), 2, 'Not instantiated correctly');
    });
    it('removeInstance()', function () {
      locator.printLog(true);
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, true),
        'Service instantiation failed: ' + ServiceOne.name);
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, true),
        'Service instantiation failed: ' + ServiceTwo.name);
      assert.isTrue(locator.register(ServiceThree.name, ServiceThree, true),
        'Service instantiation failed: ' + ServiceThree.name);
      assert.isTrue(locator.register(ServiceFour.name, ServiceFour, true),
        'Service instantiation failed: ' + ServiceFour.name);
      assert.lengthOf(locator.getAllInstantiate(), 4);
      assert.isTrue(locator.removeInstance(ServiceOne.name));
      assert.lengthOf(locator.getAllInstantiate(), 3);
      assert.isTrue(locator.removeInstance(ServiceTwo.name));
      assert.lengthOf(locator.getAllInstantiate(), 2);
      assert.isTrue(locator.removeInstance(ServiceThree.name));
      assert.lengthOf(locator.getAllInstantiate(), 1);
      assert.isTrue(locator.removeInstance(ServiceFour.name));
      assert.lengthOf(locator.getAllInstantiate(), 0);
    });
  });
  describe('De-registration', function () {
    beforeEach(function () {
      fresh();
    });
    it('unRegister() - without arguments', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, true),
        'Service registered incorrectly');
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, false),
        'Service registered incorrectly');
      assert.lengthOf(locator.getAllInstantiate(), 1,
        'Expect services registered');
      assert.deepEqual(locator.unRegister(ServiceOne.name),
        {name: 'ServiceOne', __mixins: ['id'], id: 'ServiceOne'},
        'Service has unexpected'
      );
      assert.isFalse(locator.isRegistered(ServiceOne.name));
      assert.isNull(locator.unRegister(ServiceTwo.name));
      assert.isFalse(locator.isRegistered(ServiceTwo.name));
    });
    it('unRegister() - don\'t remove mixins', function () {
      assert.isObject(locator.mixin(mixin),
        'Mixins not applied');
      assert.deepEqual(locator.getMixin(), mixin,
        'Mixins not applied correctly');
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, true),
        'Service registered incorrectly');
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, false),
        'Service registered incorrectly');
      assert.lengthOf(locator.getAllInstantiate(), 1,
        'Expect services registered');
      assert.includeMembers(
        keys(locator.get(ServiceOne.name)),
        merge(keys(mixin), ['__mixins', 'id', 'name']),
        'Different set of members'
      );
      assert.deepEqual(
        keys(locator.unRegister(ServiceOne.name)), merge(keys(mixin), ['__mixins', 'id', 'name']),
        'Different set of members'
      );
      assert.isFalse(locator.isRegistered(ServiceOne.name));
      assert.isNull(locator.unRegister(ServiceTwo.name));
      assert.isFalse(locator.isRegistered(ServiceTwo.name));
    });
    it('unRegister() - remove mixins', function () {
      assert.isObject(locator.mixin(mixin),
        'Mixins not applied');
      assert.deepEqual(locator.getMixin(), mixin,
        'Mixins not applied correctly');
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne, true),
        'Service registered incorrectly');
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, false),
        'Service registered incorrectly');
      assert.lengthOf(locator.getAllInstantiate(), 1,
        'Expect services registered');
      assert.deepEqual(
        keys(locator.get(ServiceOne.name)), merge(keys(mixin), ['__mixins', 'id', 'name']),
        'Different set of members'
      );
      assert.deepEqual(keys(locator.unRegister(ServiceOne.name, true)), ['name'],
        'Different set of members after un-registration'
      );
      assert.isFalse(locator.isRegistered(ServiceOne.name));
      assert.isNull(locator.unRegister(ServiceTwo.name));
      assert.isFalse(locator.isRegistered(ServiceTwo.name));
    });
    it('unRegisterAll() - without arguments', function () {
      assert.isObject(locator.mixin(mixin));
      services.forEach(function (service) {
        assert.isTrue(locator.register(pullName(service), service));
      });
      var unregistered = locator.unRegisterAll();
      assert.isObject(unregistered);
      var mix = merge(keys(mixin), ['__mixins', 'id']);
      services.forEach(function (service) {
        var name = pullName(service);
        assert.property(unregistered, name);
        assert.includeMembers(keys(unregistered[name]), mix);
      });
    });
    it('unRegisterAll() - don\'t remove mixins', function () {
      assert.isObject(locator.mixin(mixin));
      services.forEach(function (service) {
        assert.isTrue(locator.register(pullName(service), service));
      });
      var unregistered = locator.unRegisterAll(false);
      assert.isObject(unregistered);
      var mix = merge(keys(mixin), ['__mixins', 'id']);
      services.forEach(function (service) {
        var name = pullName(service);
        assert.property(unregistered, name);
        assert.includeMembers(keys(unregistered[name]), mix);
      });
    });
    it('unRegisterAll() - remove mixins', function () {
      assert.isObject(locator.mixin(mixin));
      services.forEach(function (service) {
        assert.isTrue(locator.register(pullName(service), service));
      });
      var unregistered = locator.unRegisterAll(true);
      assert.isObject(unregistered);
      services.forEach(function (service) {
        var name = pullName(service);
        assert.property(unregistered, name);
        keys(mixin).forEach(function (propName) {
          assert.notProperty(unregistered[name], propName);
        });
      });
    });
  });
  describe('State check', function () {
    beforeEach(function () {
      fresh();
    });
    it('isRegistered()', function () {
      assert.isFalse(locator.isRegistered(),
        'Non existent service');
      assert.isFalse(locator.isRegistered(ServiceOne.name),
        'Non existent service');
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne));
      assert.isTrue(locator.isRegistered(ServiceOne.name),
        'Service not registered correctly');
    });
    it('isInstantiated()', function () {
      assert.isTrue(locator.register(ServiceOne.name, ServiceOne),
        ServiceOne.name);
      assert.isTrue(locator.isInstantiated(ServiceOne.name),
        ServiceOne.name);
      assert.isTrue(locator.register(ServiceTwo.name, ServiceTwo, false),
        ServiceTwo.name);
      assert.isFalse(locator.isInstantiated(ServiceTwo.name),
        ServiceTwo.name);
      assert.isTrue(locator.register(ServiceThree.name, ServiceThree, true),
        ServiceThree.name);
      assert.isTrue(locator.isInstantiated(ServiceThree.name),
        ServiceThree.name);
    });
  });
});
