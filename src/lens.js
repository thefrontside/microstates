import { append, foldl, Functor, map, Semigroup, type } from 'funcadelic';

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

export function Lens(get, set) {
  return f => context => {
    return map(value => set(value, context), f(get(context)));
  }
}

export const transparent = Lens(x => x, y => y);

export function ValueAt(property) {
  let get = context => context != null ? context[property] : undefined;
  let set = (value, context = {}) => {
    if (value === context[property]) {
      return context;
    } else if (Array.isArray(context)) {
      let clone = context.slice();
      clone[Number(property)] = value;
      return clone;
    } else {
      return Semigroup.for(Object).append(context, {[property]: value});
    }
  };

  return Lens(get, set);
}

export function Path(path = []) {
  return foldl((lens, key) => {
    return compose(lens, ValueAt(key))
  }, transparent, path);
}


export const Container = type(class Container {
  At(key, container = {}) {
    return this(container).At(key, container);
  }
})

export const { At } = Container.prototype;

function BuiltinAt(key, defaultValue, embed) {
  function getter(object) {
    if (object != null) {
      return object[key];
    } else {
      return undefined;
    }
  }

  function setter(child, whole = defaultValue) {
    let current = whole[key];
    if (current === child) {
      return whole;
    } else {
      return embed(whole, key, child);
    }
  }
  return Lens(getter, setter);
}

Container.instance(Object, {
  At(key) {
    return BuiltinAt(key, {}, (whole, key, child) => {
      return append(whole, {
        [key]: child
      })
    })
  }
})

Container.instance(Array, {
  At(key) {
    return BuiltinAt(key, [], (whole, key, child) => {
      let next = whole.slice();
      next[key] = child;
      return next;
    })
  }
})
