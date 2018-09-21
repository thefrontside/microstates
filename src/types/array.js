import { Assemble } from '../assemble';
import { create, Meta } from "../microstates";
import { set } from "../lens";
import { Reducible } from '../../src/query';
import parameterized from '../parameterized';

export default parameterized(T => class ArrayType {
  static T = T;
  static get name() {
    return `Array<${T.name}>`;
  }

  push(value) {
    return [...this.state, value];
  }

  pop() {
    return this.state.slice(0, -1);
  }

  shift() {
    let [, ...rest] = this.state;
    return rest;
  }

  unshift(value) {
    return [value, ...this.state];
  }

  filter(fn) {
    return this.state.reduce((filtered, item, index) => {
      let substate = this[index];
      return fn(substate) ? filtered.concat(substate.state) : filtered;
    }, []);
  }

  map(fn) {
    return this.state.map((item, index) => {
      let mapped = fn(create(T, item));
      if (mapped != null) {
        return mapped.state != null ? mapped.state : mapped;
      } else {
        return mapped;
      }
    });
  }

  clear() {
    return [];
  }

  static initialize() {
    Assemble.instance(this, {
      assemble(Type, microstate, value) {
        if (value == null) {
          microstate.state = [];
        }
        else if (!Array.isArray(value)) {
          microstate.state = [value];
        }
        return microstate.state.reduce((microstate, member, index) => {
          return Object.defineProperty(microstate, index, {
            enumerable: true,
            get() {
              return Meta.mount(this, index, create(T, member));
            }
          });
        }, microstate);
      }
    });

    Reducible.instance(this, {
      reduce(array, fn, initial) {
        return array.state.reduce((reduction, value, index) => {
          return fn(reduction, array[index], index);
        }, initial);
      }
    });
  }
});
