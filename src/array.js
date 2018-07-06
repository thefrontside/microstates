import { create, parameterized, SubstateAt, Picostate, Meta } from "./picostates";
import { set } from "./lens";
import { Filterable } from 'funcadelic';

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
    Picostate.instance(this, {
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
    Filterable.instance(this, {
      filter(fn, array) {
        return array.state.reduce((filtered, item, index) => {
          let subject = array[index];
          if (fn(subject)) {
            return filtered.concat(subject);
          } else {
            return filtered;
          }
        }, []);
      }
    })
  }
});
