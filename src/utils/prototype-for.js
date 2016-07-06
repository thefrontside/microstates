import assign from './assign';
import MicroState from '../microstate';

const { getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty } = Object;

export default function prototypeFor(prototype, attrs) {

    return getOwnPropertyNames(attrs).reduce(function(prototype, name) {

      if (name === 'constructor' || name === 'prototype') {
        return prototype;
      }

      let descriptor = getOwnPropertyDescriptor(attrs, name);

      if (descriptor.get && typeof descriptor.get === 'function') {

        defineProperty(prototype, name, descriptor);

      } else if (name === 'transitions' && typeof descriptor.value === 'object') {        

        defineTransitions(prototype, descriptor.value);

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
      defineProperty(prototype, name, makeTransitionDescriptor(descriptor.value));
    });
  }

  function makeTransitionDescriptor(transition) {
    return {
      value: function() {
        let result = transition.call(this, this.value, ...arguments);
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
    };
  }