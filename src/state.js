import assign from './assign';
import Metadata from './metadata';

class Opaque {
  constructor(value) {
    if (value instanceof Object) {
      assign(this, value.valueOf());
    }
    Object.defineProperty(this, 'valueOf', {
      value() { return value.valueOf(); },
      enumerable: false
    });
    Object.freeze(this);
  }

  static extend(properties) {
    let Type = class State extends this {};
    let metadata = new Metadata(Type, this, properties);
    Type.metadata = metadata;
    Type.prototype = metadata.prototype;
    return Type;
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
