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

  // stubs for array access
  first(array) {
    return at(array, 0);
  }

  second(array) {
    return at(array, 1);
  }
  third(array) {
    return at(array, 2);
  }
  at(array, index) {
    return array[index];
  }
  last(array) {
    return at(array, array.length - 1);
  }
});

Reducible.instance(Array, {
  reduce(array, fn, initial) {
    return array.reduce(fn, initial);
  }
});

export const { map, filter, reduce, first, second, third, at, last } = Reducible.prototype;
