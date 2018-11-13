import { append, filter, map } from 'funcadelic';
import parameterized from '../parameterized';
import { mount, valueOf } from '../meta';
import { create } from '../microstates';
import { Entry } from '../query';

export default parameterized(T => class ObjectType {
  static T = T;

  static get name() {
    return `Object<${T.name}>`;
  }

  constructor(value) {
    Object.keys(value || {}).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return mount(this, create(T, value[key]), key);
        }
      });
    });
  }

  initialize(value) {
    return value == null ? {} : this;
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
    return filter(({ key, value }) => valueOf(fn(create(T, value), key)), valueOf(this));
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
