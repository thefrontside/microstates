import { Assemble } from '../assemble';
import { create, SubstateAt, Meta } from "../microstates";
import { set } from "../lens";
import { Reducible } from '../../src/query';
import { Filterable } from 'funcadelic';
import parameterized from '../parameterized';

export default parameterized(T => class ArrayType {
  static get name() {
    return `Array<${T.name}>`;
  }

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
      assemble(Type, microstate, value) {
        if (value == null) {
          microstate.state = [];
        }
        else if (!Array.isArray(value)) {
          microstate.state = [value];
        }
        return microstate.state.reduce((microstate, member, index) => {
          return set(SubstateAt(index), create(T).set(member), microstate);
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
