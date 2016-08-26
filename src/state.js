import assign from './assign';

export default class State {
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

  set(value) {
    return new this.constructor(value);
  }

  assign(attrs) {
    return this.set(assign({}, this.valueOf(), attrs));
  }

  put(key, value) {
    return this.assign({ [key]: value });
  }

  delete(key) {
    let value = this.valueOf();
    let keys = Object.keys(value).filter(k => k !== key);
    return this.set(keys.reduce((remaining, key)=> {
      return assign(remaining, { [key]: value[key]});
    }, {}));
  }
}
