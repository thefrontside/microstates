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
    p  }
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

export function Prop(name) {
  let get = context => context != null ? context[name] : undefined;
  let set = (value, context = {}) => {
    if (value === context[name]) {
      return context;
    } else {
      return append(context, {[name]: value})
    }
  };

  return Lens(get, set);
}

export function Lens(get, set) {
  return f => context => {
    return map(value => set(value, context), f(get(context)));
  }
}

export const transparent = Lens(x => x, y => y);

export function Path(path = []) {
  return foldl((lens, key) => {
    return compose(lens, Prop(key))
  }, transparent, path);
}

export function Substate(name) {
  let get = context => context != null ? context[name] : undefined;
  let set = (substate, context) => {
    if (substate === context[name]) {
      return context;
    } else {
      return append(context, {
        [name]: substate,
        state: append(context.state || {}, { [name]: substate.state })
      })
    }
  };

  return Lens(get, set);
}

export function SubstatePath(path = []) {
  return foldl((lens, key) => {
    return compose(lens, Substate(key))
  }, transparent, path);
}
