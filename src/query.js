import { type } from 'funcadelic';

export const Reducible = type(class Reducible {
  reduce(reducible, fn, initial) {
    let { reduce } = this(reducible);
    return reduce(reducible, fn, initial);
  }

  sum(reducible, getter) {
    return reduce(reducible, (total, member) => total + getter(member), 0);
  }
});

export const { reduce, sum } = Reducible.prototype;
