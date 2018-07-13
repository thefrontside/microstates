import { Assemble } from '../assemble';
import { create, SubstateAt, Meta } from "../picostates";
import { set } from "../lens";
import { Reducible } from '../../src/query';
import { Filterable } from 'funcadelic';
import parameterized from '../parameterized';

export default parameterized(T => class ArrayType {
  push(value) {
    return [...this.state, value];
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
      let substate = Meta.source(this[index]);
      return fn(substate) ? filtered.concat(substate) : filtered;
    }, []);
  }

  map(fn) {
    return this.state.map((item, index) => fn(Meta.source(this[index])));
  }

  clear() {
    return [];
  }

  static initialize() {
    Assemble.instance(this, {
      assemble(Type, picostate, value) {
        if (value == null) {
          picostate.state = [];
        }
        else if (!Array.isArray(value)) {
          picostate.state = [value];
        }
        return picostate.state.reduce((picostate, member, index) => {
          return set(SubstateAt(index), create(T).set(member), picostate);
        }, picostate);
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
