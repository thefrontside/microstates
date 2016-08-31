import assign from './assign';
import ComputedProperty from './computed-property';
import { eachProperty, mapObject } from './object-utils';

const { keys, defineProperty, getOwnPropertyDescriptors } = Object;

const Metadata = cached(class Metadata {
  constructor(type, supertype, properties) {
    this.type = type;
    this.supertype = supertype;
    this.properties = properties;
  }

  construct(Opaque, state, value) {
    keys(value).forEach((key)=> {
      defineProperty(state, key, new ValueProperty(Opaque, state, key, value));
    });

    Object.defineProperty(state, 'valueOf', new ValueOfMethod(Opaque, value));
  }

  get prototype() {
    return Object.create(this.supertype.prototype, this.ownTransitions);
  }

  get ownTransitions() {
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
  }

  get transitions() {
    let transitions = {};
    for (let metadata = this; metadata; metadata = metadata.supertype.metadata) {
      assign(transitions, metadata.ownTransitions);
    }
    return transitions;
  }

});

function contextualize(state, container, key) {
  let metadata = state.constructor.metadata;
  return Object.create(state, mapObject(metadata.transitions, function(name) {
    return new ComputedProperty(function() {
      return function(...args) {
        let result = state[name].call(state, ...args);
        return container.put(key, result);
      };
    });
  }));
}

export default function extend(Super, properties) {
  let Type = class State extends Super {};
  let metadata = new Metadata(Type, Super, properties);
  Type.metadata = metadata;
  Type.prototype = metadata.prototype;
  Type.prototype.constructor = Type;
  return Type;
}

function cached(constructor) {
  let prototype = constructor.prototype;

  eachProperty(getOwnPropertyDescriptors(prototype), function(key, descriptor) {
    if (descriptor.get) {
      defineProperty(prototype, key, new ComputedProperty(function() {
        return descriptor.get.call(this);
      }));
    }
  });
  return constructor;
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
