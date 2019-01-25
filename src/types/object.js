import { append, filter, map } from 'funcadelic';
import parameterized from '../parameterized';
import { valueOf } from '../meta';
import { create } from '../microstates';

export default parameterized(T => class ObjectType {
  static T = T;

  static get name() {
    return `Object<${T.name}>`;
  }

  constructor(value) {
    Object.keys(value || {}).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return create(T, value[key]);
        }
      });
    });
  }

  initialize(value) {
    return value.valueOf() == null ? {} : this;
  }

  assign(attrs) {
    return append(valueOf(this), map(valueOf, attrs));
  }

  put(name, value) {
    return this.assign({[name]: value});
  }

  delete(name) {
    return filter(({ key }) => key !== name, valueOf(this));
  }

  map(fn) {
    return map(value => valueOf(fn(create(T, value))), valueOf(this));
  }

  filter(fn) {
    return filter(({ key, value }) => fn(create(T, value), key), valueOf(this));
  }

  [Symbol.iterator]() {
    let object = this;
    let iterator = Object.keys(valueOf(this))[Symbol.iterator]();
    return {
      next() {
        let next = iterator.next();
        return {
          get done() { return next.done; },
          get value() { return new Entry(next.value, object[next.value]); }
        };
      }
    };
  }
});

class Entry {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }

  [Symbol.iterator]() {
    return [this.value, this.key][Symbol.iterator]();
  }
}
