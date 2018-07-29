import { type } from 'funcadelic';

export const Reducible = type(class Reducible {
  reduce(reducible, fn, initial) {
    let { reduce } = this(reducible);
    return reduce(reducible, fn, initial);
  }

  filter(reducible, predicate) {
    return reduce(reducible, (filtered, member) => predicate(member) ? filtered.concat(member) : filtered, []);
  }
});

export const { reduce, filter } = Reducible.prototype;
