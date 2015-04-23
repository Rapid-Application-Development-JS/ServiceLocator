var chai = require('chai');
var assert = chai.assert;
var should = chai.should();
var ServiceLocator = require('../source/service-locator.js');
describe('0.1: Service Locator. Basic tests.', function () {
  var ServiceLocatorConstructor = null;
  var serviceLocator = null;
  var serviceName = 'ExampleService';
  var serviceResult = 'Service resolve result';
  var ExampleService = function ExampleService() {
    this.resolve = function () {
      return serviceResult;
    };
  };
  it('0.1.1: Service Locator → Initialization', function (done) {
    ServiceLocatorConstructor = ServiceLocator.Constructor;
    assert.typeOf(ServiceLocatorConstructor, 'function');
    serviceLocator = new ServiceLocatorConstructor();
    assert.typeOf(serviceLocator, 'object');
    done();
  });
  it('0.1.2: Service Locator → Register Service', function (done) {
    (serviceLocator.register(serviceName, ExampleService)).should.equal(true);
    done();
  });
  it('0.1.3: Service Locator → Instantiate Services', function (done) {
    serviceLocator.instantiateAll();
    var services = serviceLocator.getAllInstantiate();
    assert.typeOf(services, 'array');
    (services.length).should.equal(1);
    done();
  });
  it('0.1.4: Service Locator → Get service', function (done) {
    var exampleService = serviceLocator.get(serviceName);
    assert.typeOf(exampleService, 'object');
    var result = exampleService.resolve();
    (result).should.equal(serviceResult);
    done();
  });
  it('0.1.5: Service Locator → Unregister Service', function (done) {
    serviceLocator.unregister(serviceName);
    assert.typeOf(serviceLocator.get("ExampleService"), 'null');
    done();
  });
});
