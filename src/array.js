import { create, parameterized, SubstateAt, Picostate, Meta } from "./picostates";
import { set } from "./lens";

export default parameterized(T => class ArrayType {
  push(value) {
    return create(this.constructor, [...this.state, value]);
  }

  shift() {
    let [, ...rest] = this.state;
    return create(this.constructor, rest);
  }

  unshift(value) {
    return create(this.constructor, [value, ...this.state]);
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
    return create(this.constructor, []);
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
    })
  }
});
