import assign from './assign';
import extend from './extend';

class Opaque {
  constructor(value) {
    let metadata = this.constructor.metadata;
    metadata.construct(Opaque, this, value);
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
