import { type } from 'funcadelic';

export const Reducible = type(class Reducible {
  reduce(reducible, fn, initial) {
    let { reduce } = this(reducible);
    return reduce(reducible, fn, initial);
  }

  map(reducible, fn) {    
    return reduce(reducible, (mapped, member) => mapped.concat(fn(member)), []);
  }

  filter(reducible, predicate) {
    return reduce(reducible, (filtered, member) => predicate(member) ? filtered.concat(member) : filtered, []);
  }
});

Reducible.instance(Array, {
  reduce(array, fn, initial) {
    return array.reduce(fn, initial);
  }
});

export const { map, filter, reduce } = Reducible.prototype;
