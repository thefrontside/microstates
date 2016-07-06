import assign from './assign';
import MicroState from '../microstate';

const { getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty } = Object;

export default function prototypeFor(prototype, attrs) {

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

      } else if (isMethod(descriptor)) {
        // TODO: implement what happens with functions (helper?)
        defineProperty(prototype, name, descriptor);
      }

      return prototype;
    }, prototype);

  }

  function defineTransitions(prototype, transitions) {
    // property is transitions hash
    transitions = assign({}, transitions, {
      replace(current, ...args) {
        return new this.constructor(...args);
      }
    });

    getOwnPropertyNames(transitions).forEach(function(name){
      let descriptor = getOwnPropertyDescriptor(transitions, name);
      defineProperty(prototype, name, {
        value: transitionHandler(descriptor.value)
      });
    });
  }

  function transitionHandler(callback) {
    return function() {
      let result = callback.call(this, this.value, ...arguments);
      if (result instanceof this.constructor){
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