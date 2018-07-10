import { type } from 'funcadelic';

export const Reducible = type(class Reducible {
  reduce(reducible, fn, initial) {
    let { reduce } = this(reducible);
    return reduce(reducible, fn, initial);
  }

  sum(reducible, getter) {
    return reduce(reducible, (total, member) => total + getter(member), 0);
  }

  filter(reducible, predicate) {
    return reduce(reducible, (filtered, member) => predicate(member) ? filtered.concat(member) : filtered, []);
  }
});

export const { reduce, sum, filter } = Reducible.prototype;
