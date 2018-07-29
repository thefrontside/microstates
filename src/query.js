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

export const Mappable = type(class Mappable {
  map(mappable, fn) {
    let { map } = this(mappable);
    return map(mappable, fn);
  }
});

export const { map } = Mappable.prototype;
export const { reduce, filter } = Reducible.prototype;
