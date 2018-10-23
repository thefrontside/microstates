import { Functor, map, Semigroup } from 'funcadelic';

class Box {
  static get of() {
    return (...args) => new this(...args);
  }

  static unwrap(box) {
    return box.value;
  }

  constructor(value) {
    this.value = value;
  }
}

const { unwrap } = Box;

class Id extends Box {}

class Const extends Box {}

Functor.instance(Id, {
  map(fn, id) {
    let next = fn(id.value);
    return next === id.value ? id : Id.of(next);
  }
});

Functor.instance(Const, {
  map(fn, constant) {
    return constant;
  }
});

export function compose(f, g) {
  return (...x) => f(g(...x));
}

export function view(lens, context) {
  let get = compose(unwrap, lens(Const.of));
  return get(context);
}

export function over(lens, fn, context) {
  let update = compose(unwrap, lens(compose(Id.of, fn)));
  return update(context);
}

export function set(lens, value, context) {
  return over(lens, () => value, context);
}

export function Lens(get, set) {
  return f => context => {
    return map(value => set(value, context), f(get(context)));
  };
}

export const transparent = Lens(x => x, y => y);

export function At(property, container = {}) {
  let get = context => context != null ? context[property] : undefined;
  let set = (part, whole) => {
    let context = whole == null ? (Array.isArray(container) ? [] : {}) : whole;
    if (part === context[property]) {
      return context;
    } else if (Array.isArray(context)) {
      let clone = context.slice();
      clone[Number(property)] = part;
      return clone;
    } else {
      return Semigroup.for(Object).append(context, {[property]: part});
    }
  };

  return Lens(get, set);
}

export function Path(path = []) {
  return path.reduce((lens, key) => compose(lens, At(key)), transparent);
}
