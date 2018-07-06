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
    return create(this.constructor, this.state.reduce((filtered, value, index) => {
      if (fn(Meta.source(this[index]))) {
        return filtered.concat(value);
      } else {
        return filtered;
      }
    }, []));
  }

  map(fn) {
    return create(this.constructor, this.state.reduce((mapped, value, index) => {
      return mapped.concat(fn(Meta.source(this[index])));
    },[]));
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
          let child;
          if (member && member.constructor.isPicostateType) {
            child = member;
          } else {
            child = create(T, member);
          }
          return set(SubstateAt(index), child, picostate);
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
