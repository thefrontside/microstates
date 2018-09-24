import { append, filter, map } from 'funcadelic';
import parameterized from '../parameterized'
import { mount, valueOf, sourceOf } from '../meta';
import { create } from '../microstates';

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
      })
    })
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
    return map((v, key) => fn(sourceOf(this[key]), key), valueOf(this));
  }

  filter(fn) {
    return filter(({ key }) => fn(sourceOf(this[key]), key), valueOf(this));
  }
});
