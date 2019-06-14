import { append, filter, map } from 'funcadelic';
import { at, Context } from '@microstates/lens';
import { reduce, query } from '../query';
import parameterized from '../parameterized';
import { valueOf, mount } from '../meta';
import { create } from '../microstates';
import { Tree } from '../tree';

export default parameterized(T => class ObjectType {
  static T = T;

  static name = `Object<${T.name}>`

  get entries() {
    return reduce(this, (entries, entry) => Object.assign(entries, {
      [entry.key]: entry.value
    }), {});
  }

  get keys() {
    return Object.keys(valueOf(this));
  }

  get values() {
    return query(this).map(entry => entry.value);
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
          get value() {
            if (!next.done) {
              return new Entry(next.value, at(next.value, object));
            } else {
              return undefined;
            }
          }
        };
      }
    };
  }

  static initialize() {

    Context.instance(this, {
      at(key, object) {
        if (typeof key !== 'string') {
          return object[key];
        } else {
          let value = valueOf(object)[key];
          return mount(object, create(T, value), key);
        }
      }
    });

    Tree.instance(this, {
      defineChildren(fn, object) {
        let generate = object[Symbol.iterator];
        return Object.defineProperty(object, Symbol.iterator, {
          enumerable: false,
          value() {
            let iterator = generate.call(object);
            return {
              next() {
                let next = iterator.next();
                return {
                  get done() { return next.done; },
                  get value() {
                    if (!next.done) {
                      let { key } = next.value;
                      return new Entry(key, fn(key));
                    } else {
                      return undefined;
                    }
                  }
                };
              }
            };
          }
        });
      }
    });
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
