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
          value: function() {
            return merge(this, descriptor.value.call(this, this.value, ...arguments));
          }
        });
      });
    }

    function defineSubstate (prototype, name, Substate) {
      let hidden = `__${name}`;
      defineProperty(prototype, hidden, {
        writable: true,
        configurable: false,
        enumerable: false
      });
      defineProperty(prototype, name, {
        enumerable: true,
        configurable: false,
        get() {
          return this[hidden];
        },
        set(substate) {

          if (!(substate instanceof Substate)) {
            substate = new Substate(...arguments);
          }

          let context = this;

          defineProperty(substate, '__merge', {
            value: function(attrs) {
              return merge(context, {
                [name]: attrs
              });
            },
            configurable: true
          });

          return this[hidden] = substate;
        }
      });
    }

  }
  
  function merge(target, attrs) {
    if (attrs instanceof target.constructor){
      return attrs;
    }

    if (target.__merge) {
      return target.__merge(attrs);
    }

    let next = new target.constructor();

    let keys = Object.keys(attrs);
    let seen = []

    getOwnPropertyNames(next).forEach(function(name){
      let descriptor = getOwnPropertyDescriptor(next, name);
      if (descriptor.hasOwnProperty('value') && descriptor.writable) {
        next[name] = attrs[name] || target[name];
        seen.push(name);
      }
    });
    getOwnPropertyNames(next.constructor.prototype).forEach(function(name){
      let descriptor = getOwnPropertyDescriptor(next.constructor.prototype, name);
      if (isMicrostate(descriptor)) {
        next[name] = attrs[name] || target[name];
        seen.push(name);
      }
    });

    keys.forEach(function(name){
      if (seen.indexOf(name) === -1) {
        next[name] = attrs[name];
        seen.push(name);
      }
    });

    return next;
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