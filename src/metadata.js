import assign from './assign';
import ComputedProperty from './computed-property';

export default class Metadata {
  constructor(type, supertype, properties) {
    this.type = type;
    this.supertype = supertype;
    this.properties = properties;
  }

  get prototype() {
    return cache(this, 'prototype', ()=> {
      return Object.create(this.supertype.prototype, this.transitions);
    });
  }

  get transitions() {
    return cache(this, 'transitions', ()=> {
      return mapObject(this.properties.transitions, function(method) {
        return new ComputedProperty(function() {
          return function(...args) {
            let state = this;
            let result = method.call(state, state.valueOf(), ...args);
            let Type = this.constructor;
            if (result instanceof Type) {
              return result;
            } else {
              return new Type(result.valueOf());
            }
          };
        });
      });
    });
  }
}

/**
 * Maps over the keys of an object converting the values of those keys into new
 * objects. E.g.
 *
 * > mapObject({first: 1, second: 2}, (value)=> value *2)
 *
 *   {first: 2, second: 4}
 */
function mapObject(object = {}, fn) {
  return Object.getOwnPropertyNames(object).reduce(function(result, name) {
    return assign(result, { [name]: fn(object[name])});
  }, {});
}


/**
 * Caches the value of a computation as an object property.
 *
 * Metadata like the prototype and the transition property descriptors are
 * computed lazily in order to make reasoning about them easier. However, we
 * don't want there to be a new object calculated every time that we
 * ask for an object's prototype. This function can be called within a
 * lazy getter, and it will _overwrite_ that getter with the computed
 * value so that subsequent property gets will just return the
 * computed value directly.
 */
function cache(object, propertyName, compute) {
  let value = compute();
  Object.defineProperty(object, propertyName, {
    value,
    enumerable: false,
    writeable: false
  });
  return value;
}
