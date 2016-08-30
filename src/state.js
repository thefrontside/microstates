import assign from './assign';
import extend, { contextualize } from './extend';

const { keys, defineProperty } = Object;

class Opaque {
  constructor(value) {
    if (value instanceof Object) {
      keys(value).forEach((key)=> {
        defineProperty(this, key, new ValueProperty(this, key, value));
      });
    }
    Object.defineProperty(this, 'valueOf', {
      value() {
        let unboxed = value.valueOf();
        return Object.keys(unboxed).reduce(function(valueOf, key) {
          let prop = unboxed[key];
          if (prop instanceof Opaque) {
            return assign({}, valueOf, { [key]: prop.valueOf() });
          } else {
            return valueOf;
          }
        }, unboxed);
      },
      enumerable: false
    });
    Object.freeze(this);
  }

  static extend(properties) {
    return extend(this, properties);
  }
}

export default Opaque.extend({
  transitions: {
    set(current, value) {
      return new this.constructor(value);
    },
    assign(current, attrs) {
      return assign({}, current, attrs);
    },
    put(current, key, value) {
      return assign({}, current, { [key]: value});
    },
    delete(current, key) {
      let keys = Object.keys(current).filter(k => k !== key);
      return keys.reduce((next, key)=> {
        return assign(next, { [key]: current[key] });
      }, {});
    }
  }
});


import ComputedProperty from './computed-property';

class ValueProperty extends ComputedProperty {
  enumerable() { return true; }

  constructor(container, key, attributes) {
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

class NestedTransition extends ComputedProperty {
  constructor(container, key) {
    super(function() {
      return function(...args) {
        let result = this.super[key](...args);
        return container.put(key, result);
      };
    });
  }
}
