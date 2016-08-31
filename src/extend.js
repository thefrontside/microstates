import assign from './assign';
import ComputedProperty from './computed-property';

const { keys, defineProperty } = Object;

export default function extend(Super, properties) {
  let Type = class State extends Super {};
  let metadata = new Metadata(Type, Super, properties);
  Type.metadata = metadata;
  Type.prototype = metadata.prototype;
  Type.prototype.constructor = Type;
  return Type;
}

function contextualize(state, container, path) {
  let metadata = state.constructor.metadata;
  return Object.create(state, mapObject(metadata.transitions, function(name, method) {
    return {
      value: function(...args) {
        let result = state[name].call(state, ...args);
        return container.put(path, result);
      }
    };
  }));
}

class Metadata {
  constructor(type, supertype, properties) {
    this.type = type;
    this.supertype = supertype;
    this.properties = properties;
  }

  get prototype() {
    return cache(this, 'prototype', ()=> {
      return Object.create(this.supertype.prototype, this.ownTransitions);
    });
  }

  get ownTransitions() {
    return cache(this, 'ownTransitions', ()=> {
      return mapObject(this.properties.transitions, function(name, method) {
        return new ComputedProperty(function() {
          return function(...args) {
            let Type = this.constructor;
            let result = method.call(this, this.valueOf(), ...args);
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

  get transitions() {
    return cache(this, 'transitions', ()=> {
      let transitions = {};
      for (let metadata = this; metadata; metadata = metadata.supertype.metadata) {
        assign(transitions, metadata.ownTransitions);
      }
      return transitions;
    });
  }

  construct(Opaque, state, value) {
    keys(value).forEach((key)=> {
      defineProperty(state, key, new ValueProperty(Opaque, state, key, value));
    });

    Object.defineProperty(state, 'valueOf', new ValueOfMethod(Opaque, value));
  }
}

class ValueProperty extends ComputedProperty {
  enumerable() { return true; }

  constructor(Opaque, container, key, attributes) {
    super(function() {
      let value = attributes[key];
      if (value instanceof Opaque) {
        return contextualize(value, container, key);
      } else {
        return value;
      }
    });
  }
}

class ValueOfMethod extends ComputedProperty {
  constructor(Opaque, value) {
    super(function() {
      let result;
      return function() {
        if (result) { return result; }
        let unboxed = value.valueOf();
        result = Object.keys(unboxed).reduce(function(valueOf, key) {
          let prop = unboxed[key];
          if (prop instanceof Opaque) {
            return assign({}, valueOf, { [key]: prop.valueOf() });
          } else {
            return valueOf;
          }
        }, unboxed);
        return result;
      };
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
    return assign(result, { [name]: fn(name, object[name])});
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
