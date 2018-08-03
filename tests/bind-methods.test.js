import expect from 'expect';

import bindMethods from '../src/bind-methods';

describe('invoking bound methods', function() {
  let Type;
  let instance;
  let method;
  beforeEach(function() {
    Type = bindMethods(class {
      someMethod() {
        return this.invocant = this;
      }
    })
    instance = new Type();
    method = instance.someMethod;
    method();
  });

  it('enables invoking an instance method even though the function is unbound.', function() {
    expect(instance.invocant).toBe(instance);
  });
});
