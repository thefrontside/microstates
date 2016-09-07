import assign from './assign';
import extend from './extend';
import { reduceObject } from './object-utils';

class Opaque {
  constructor(value) {
    let metadata = this.constructor.metadata;
    metadata.construct(this, value);
    Object.freeze(this);
  }

  static extend(properties) {
    return extend(Opaque, this, properties);
  }
}

export default Opaque.extend({
  transitions: {
    set(current, value) {
      return new this.constructor(value);
    },
    assign(current, attrs) {
      return attrs;
    },
    put(current, key, value) {
      return { [key]: value };
    },
    delete(current, key) {
      return this.set(reduceObject(current, (attrs, name, value)=> {
        return name === key ? attrs : assign(attrs, { [name]: value });
      }));
    }
  }
});
