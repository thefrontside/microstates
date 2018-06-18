import { append, foldl, Functor, map } from 'funcadelic';

class Box {
  static get of() {
    return (...args) => new this(...args)
  }

  static unwrap(box) {
    return box.value;
  }

  constructor(value) {
    this.value = value;
  }
}

const { unwrap } = Box;

class Id extends Box {};

class Const extends Box {}


Functor.instance(Id, {
  map(fn, id) {
    var next = fn(id.value);
    return next === id.value ? id : Id.of(next);
  }
});

Functor.instance(Const, {
  map(fn, constant) {
    return constant;
  }
})

export function compose(f, g) {
  return (...x) => f(g(...x));
}

export function view(lens, context) {
  let get = compose(unwrap, lens(Const.of));
  return get(context);
}

export function over(lens, fn, context) {
  let update = compose(unwrap, lens(compose(Id.of, fn)));
  return update(context)
}

export function set(lens, value, context) {
  return over(lens, () => value, context);
}

export function lensKey(key) {
  let get = context => context != null ? context[key] : undefined;
  let set = (value, context) => append(context || {}, {[key]: value});

  return Lens(get, set);
}

export function Lens(get, set) {
  return f => context => {
    return map(value => set(value, context), f(get(context)));
  }
}

export const transparent = Lens(x => x, y => y);

export function lensPath(path = []) {
  return foldl((lens, key) => {
    return compose(lens, lensKey(key))
  }, transparent, path);
}
