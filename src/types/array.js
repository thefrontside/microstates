import { At, set, Tree, childAt } from '@microstates/lens';
import { mount, valueOf } from '../meta';
import { create } from '../microstates';
import parameterized from '../parameterized';

export default parameterized(T => class ArrayType {
  static T = T;

  static get name() {
    return `Array<${T.name}>`;
  }

  get length() {
    return valueOf(this).length;
  }

  initialize(value) {
    if (value == null) {
      return [];
    } else if (Array.isArray(value) || value[Symbol.iterator]) {
      return value;
    } else {
      return [value];
    }
  }

  push(value) {
    return [...valueOf(this), valueOf(value)];
  }

  pop() {
    return valueOf(this).slice(0, -1);
  }

  shift() {
    let [, ...rest] = valueOf(this);
    return rest;
  }

  unshift(value) {
    return [valueOf(value), ...valueOf(this)];
  }

  slice(begin, end) {
    let list = valueOf(this);
    let result = list.slice(begin, end);
    return list.length === result.length ? this : result;
  }

  sort(compareFn) {
    let init = valueOf(this);
    let result = [...init].sort(compareFn);
    return init.every((member, idx) => result[idx] === member) ? this : result;
  }

  filter(fn) {
    let list = valueOf(this);
    let result = list.filter((member) => fn(create(T, member)));
    return list.length === result.length ? this : result;
  }

  map(fn) {
    let list = valueOf(this);
    return list.reduce((result, member, index) => {
      let mapped = valueOf(fn(create(T, member)));
      return set(At(index, result), mapped, result);
    }, list);
  }

  remove(item) {
    return this.filter(s => valueOf(s) !== valueOf(item));
  }

  clear() {
    return [];
  }

  [Symbol.iterator]() {
    let array = this;
    let iterator = valueOf(this)[Symbol.iterator]();
    let i = 0;
    return {
      next() {
        let next = iterator.next();
        let index = i++;
        return {
          get done() { return next.done; },
          get value() {
            if (!next.done) {
              return childAt(index, array);
            } else {
              return undefined;
            }
          }
        };
      }
    };
  }

  static initialize() {

    Tree.instance(this, {
      childAt(key, array) {
        if (typeof key === 'number') {
          let value = valueOf(array)[key];
          return mount(array, create(T, value), key);
        } else {
          return array[key];
        }
      },

      defineChildren(fn, array) {
        let generate = array[Symbol.iterator];
        return Object.defineProperty(array, Symbol.iterator, {
          enumerable: false,
          value() {
            let iterator = generate.call(array);
            let i = 0;
            return {
              next() {
                let next = iterator.next();
                let index = i++;
                return {
                  get done() { return next.done; },
                  get value() {
                    if (!next.done) {
                      return fn(index, next.value, array);
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
