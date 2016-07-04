import assign from './utils/assign';

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
          // property is a getter
          defineProperty(prototype, name, descriptor);
        } else if (name === 'transitions' && typeof descriptor.value === 'object') {
          // property is transitions hash
          let transitions = assign({}, descriptor.value, {
            replace(current, ...args) {
              return new this.constructor(...args);
            }
          });
          getOwnPropertyNames(transitions).forEach(function(name){
            let descriptor = getOwnPropertyDescriptor(transitions, name);
            defineProperty(prototype, name, makeTransitionDescriptor(descriptor));
          });
        } else if (name === 'valueOf' || name === 'toString') {
          // property is a special method
          defineProperty(prototype, name, descriptor);
        } else if (descriptor.value && MicroState.isPrototypeOf(descriptor.value)) {
          // property is a substate          
          // TODO: apply substate
        } else if (descriptor.value && typeof descriptor.value === 'function') {
          // TODO: implement what happens with functions (helper?)
          defineProperty(prototype, name, descriptor);
        }

        return prototype;
      }, Object.create(Super.prototype, attrs.prototype || {}));
    }

    function makeTransitionDescriptor(descriptor) {
      return {
        value: function() {
          let result = descriptor.value.call(this, this.value, ...arguments);
          if (result instanceof Class){
            // transition returned new microstate - use it
            return result;
          } else if (typeof result === 'object') {
            // transition returned an object - merge it
            let next = new this.constructor();
            return Object.assign(next, this, result);
          } 
          // transition returned a value of different type than current value
          // return previous value
          console.error('transition returned incompatible value', name, result);
          return this;
        }
      };
    }
  }

  constructor(attrs = {}) {
    Object.assign(this, attrs);
  }
};
