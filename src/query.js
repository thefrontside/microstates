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

export const { map, filter, reduce } = Reducible.prototype;
