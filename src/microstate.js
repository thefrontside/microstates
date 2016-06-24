const { getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty } = Object;

export default class MicroState {

  static extend(name, attrs = {}) {
    let Super = this;
    let constructor = attrs.constructor || (()=> {});

    let Class = class extends Super {
      constructor() {
        super(constructor.call(null, ...arguments));
        defineProperty(this, 'constructor', { value: Class });
      }
    };
    defineProperty(Class, 'name', {value: name });
    Class.prototype = prototypeFor(attrs);
    return Class;

    function prototypeFor(attrs) {
      return getOwnPropertyNames(attrs).reduce(function(prototype, name) {
        if (name === 'constructor' || name === 'prototype') {
          return prototype;
        }

        let descriptor = getOwnPropertyDescriptor(attrs, name);
        if (descriptor.get && typeof descriptor.get === 'function') {
          defineProperty(prototype, name, descriptor);
        } else if (name === 'valueOf' || name === 'toString') {
          defineProperty(prototype, name, descriptor);
        } else if (descriptor.value && typeof descriptor.value === 'function') {
          defineProperty(prototype, name, {
            value: function() {
              let result = descriptor.value.call(this, ...arguments);
              if (!(result instanceof Class)) {
                console.warn('incompatible type', name, result);
              }
              return result;
            }
          });
        }
        return prototype;
      }, Object.create(Super.prototype, attrs.prototype || {}));
    }
  }

  constructor(attrs = {}) {
    Object.assign(this, attrs);
  }

  replace() {
    return new this.constructor(...arguments);
  }
};
