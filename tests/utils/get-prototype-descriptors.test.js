import 'jest';

import getPrototypeDescriptors from '../../src/utils/get-prototype-descriptors';

describe('utils/get-prototype-descriptors', () => {
  it('excludes methods from object', () => {
    expect(getPrototypeDescriptors(class {})).not.toHaveProperty('__defineGetter__');
  });
  it('includes class method', () => {
    expect(
      getPrototypeDescriptors(
        class {
          foo() {}
        }
      )
    ).toMatchObject({
      foo: {
        value: expect.any(Function),
      },
    });
  });
  it('includes parent classes method', () => {
    class GrandParent {
      grantParentMethod() {}
    }
    class Parent extends GrandParent {
      parentMethod() {}
    }
    class Child extends Parent {
      childMethod() {}
    }
    expect(getPrototypeDescriptors(Child)).toMatchObject({
      childMethod: {
        value: expect.any(Function),
      },
      parentMethod: {
        value: expect.any(Function),
      },
      grantParentMethod: {
        value: expect.any(Function),
      },
    });
  });
  it('has overloaded property from child', () => {
    class Parent {
      getName() {
        return 'Peter';
      }
    }
    class Child {
      getName() {
        return 'Stewie';
      }
    }
    expect(getPrototypeDescriptors(Child).getName.value()).toEqual('Stewie');
  });
});
