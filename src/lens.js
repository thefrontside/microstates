import { append, Functor, foldl, map } from 'funcadelic';

export class Const {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Const(value);
  }

  static unbox(constant) {
    return constant.value;
  }
}

Functor.instance(Const, { 
  map(fn, constant) {
    return constant;
  }
});

export class Id {
  constructor(value) {
    this.thunk = () => value;
  }

  static of(value) {
    return new Id(value);
  }

  static unbox(id) {
    return id.thunk();
  }
}

Functor.instance(Id, {
  map(fn, id) {
    return append(id, {
      thunk() {
        let current = Id.unbox(id);
        return fn(current);
      }
    });
  }
});

export function compose(f, g) {
  return (...x) => f(g(...x));
}

export function view(lens, context) {
  let get = compose(Const.unbox, lens(Const.of));
  return get(context);
}

export function over(lens, fn, context) {
  let update = compose(Id.unbox, lens(compose(Id.of, fn)));
  return update(context);
}

export function set(lens, value, context) {
  return over(lens, () => value, context);
}

export const transparent = Lens(value => value, context => context);

export function lensKey(key) {
  let get = context => context[key];
  let set = (value, context) => append(context, {[key]: value});

  return Lens(get, set);
}

export function lensPath(path) {
  return foldl((lens, key) => compose(lens, lensKey(key)), transparent, path);
}

export function Lens(unwrap, wrap) {
  return f => context => {
    return map(value => wrap(value, context), f(unwrap(context)));
  }
}
