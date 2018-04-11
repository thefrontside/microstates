import { map, append, type } from 'funcadelic';
import types, { params, any } from '../types';
import $ from '../utils/chain';
import desugar from '../desugar';

const Location = type(class Location {
  stateAt(Type, instance, value) {
    return this(Type.prototype).stateAt(instance, value);
  }
  childrenAt(Type, value) {
    return this(Type.prototype).childrenAt(Type, value);
  }
});

Location.instance(Object, {
  stateAt(instance, value) {
    if (value) {
      return append(instance, value);
    } else {
      return instance;
    }
  },

  childrenAt(Type, value) {
    return $(new Type())
      .map(desugar)
      .filter(({ value }) => !!value && value.call)
      .valueOf();
  }
});

Location.instance(types.Object, {
  stateAt: _ => ({}),
  childrenAt(Type, value) {
    let { T } = params(Type);
    if (T !== any) {
      return map(_ => T, value);
    } else {
      return Location.for(Object).childrenAt(Type, value);
    }
  }
});

Location.instance(types.Array, {
  stateAt: _ => [],
  childrenAt(...args) {
    return Location.for(types.Object.prototype).childrenAt(...args);
  }
});

export default Location;
export const { stateAt, childrenAt } = Location.prototype;