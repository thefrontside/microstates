import MicroState from '../microstate';

const { getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty } = Object;

export default function prototypeFor(prototype, attrs) {

    const constructor =  attrs.constructor || prototype.constructor;

    return getOwnPropertyNames(attrs).reduce(function(prototype, name) {

      if (name === 'constructor' || name === 'prototype') {
        return prototype;
      }

      let descriptor = getOwnPropertyDescriptor(attrs, name);

      if (isGetter(descriptor)) {

        defineProperty(prototype, name, descriptor);

      } else if (name === 'transitions' && typeof descriptor.value === 'object') {        

        defineTransitions(prototype, descriptor.value);

      } else if (name === 'valueOf' || name === 'toString') {
        // property is a special method
        defineProperty(prototype, name, descriptor);

      } else if (isMicrostate(descriptor)) {
        // property is a substate
        // TODO: apply substate
        defineSubstate(prototype, name, descriptor.value);
      } else if (isMethod(descriptor)) {
        // TODO: implement what happens with functions (helper?)
        defineProperty(prototype, name, descriptor);
      }

      return prototype;
    }, prototype);

    function defineTransitions(prototype, transitions) {
      // property is transitions hash
      transitions = Object.assign({}, transitions, {
        replace(current, ...args) {
          // TODO: check here that replace is done with a value that matches current type
          return merge(this, constructor(...args));
        }
      });

      getOwnPropertyNames(transitions).forEach(function(name){
        let descriptor = getOwnPropertyDescriptor(transitions, name);
        defineProperty(prototype, name, {
          value: transitionHandler(descriptor.value)
        });
      });
    }

    function defineSubstate (prototype, name, Substate) {
      let hidden = `__${name}`;
      defineProperty(prototype, name, {
        get() {
          return this[hidden];
        },
        set() {
          return this[hidden] = new Substate(...arguments);
        }
      });
    }

  }

  function transitionHandler(callback) {
    return function() {
      let result = callback.call(this, this.value, ...arguments);

      if (result instanceof this.constructor){
        // transition returned new microstate - use it
        // TODO: remove this
        // this condition should never happen because returning an instance will be come a special
        // case reached only by top most context
        return result;
      } else if (typeof result === 'object') {
        // transition returned an object - merge it
        return merge(this, result);
      } 
      // transition returned a value of different type than current value
      // return previous value

      console.error('transition returned incompatible value', name, result);
      return this;
    }
  }

  function merge(target, attrs) {
    let next = new target.constructor();
    return Object.assign(next, this, attrs);
  }

  function isGetter(descriptor) {
    return descriptor.get && typeof descriptor.get === 'function';
  }

  function isMicrostate(descriptor) {
    return descriptor.value && MicroState.isPrototypeOf(descriptor.value);
  }

  function isMethod(descriptor) {
    return descriptor.value && typeof descriptor.value === 'function';
  }