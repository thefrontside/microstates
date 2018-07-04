import { append, filter, foldl, Semigroup, map, stable, type } from 'funcadelic';
import { view, set, over, Lens } from './lens';

export const Picostate = type(class {
  assemble(Type, picostate, value) {
    return this(picostate).assemble(Type, picostate, value);
  }
})

const { assemble } = Picostate.prototype;

Picostate.instance(Object, {
  assemble(Type, picostate, value) {
    return foldl((picostate, { key, value: child }) => {
      let substate = value != null && value[key] != null ? child.set(value[key]) : child;
      return set(Substate(key), substate, picostate)
    }, picostate, new Type());
  }
})

export function create(Type = Any, value) {
  let PicoType = toPicoType(Type);
  let instance = new PicoType();
  instance.state = value
  let picostate = assemble(Type, instance, value);

  if (Type.prototype.hasOwnProperty('initialize') && typeof picostate.initialize === 'function') {
    return picostate.initialize(value);
  } else {
    return picostate;
  }
}

const toPicoType = stable(function toPicoType(Type) {
  if (Type.isPicostateType) {
    return Type;
  }
  let PicoType = class extends Type {
    static get name() {
      return `Picostate<${Type.name}>`;
    }
    static isPicostateType = true;

    set(value) {
      let microstate
      if (value === this.state) {
        microstate = this;
      } else if (isPicostate(value)) {
        microstate = value;
      } else {
        microstate = create(this.constructor, value);
      }
      let meta = Meta.get(this);
      return set(meta.lens, microstate, meta.context);
    }
  }
  let methods = filter(name => name !== 'constructor' && name !== 'set' && typeof Type.prototype[name] === 'function', Object.getOwnPropertyNames(Type.prototype));

  Object.assign(PicoType.prototype, foldl((methods, name) =>  {
    methods[name] = function(...args) {
      let method = Type.prototype[name];
      let meta = Meta.get(this);
      let result = method.apply(meta.source || this, args);
      return this.set(result);
    }
    return methods;
  }, {}, methods))
  return PicoType;
});

function isPicostate(value) {
  return value != null && value.constructor.isPicostateType;
}

export class Any { }

export class Meta {
  constructor(attrs = {}) {
    this.path = attrs.path || [];
  }

  get lens() {
    return SubstatePath(this.path);
  }

  static get(object) {
    if (object == null) {
      throw new Error('cannot lookup Meta of null or undefined');
    }
    return view(Meta.lens, object);
  }

  static source(picostate) {
    return Meta.get(picostate).source || picostate;
  }

  static map(fn, object) {
    return over(Meta.lens, meta => append(meta, fn(meta)), object);
  }

  static treemap(fn, object) {
    let children = map(child => isPicostate(child) ? Meta.treemap(fn, child) : child, object);
    return append(Meta.map(fn, object), children);
  }

  static lookup(object) {
    return object[Meta.LOOKUP] || new Meta({ context: object });
  }

  static LOOKUP = Symbol('Meta');

  static lens = Lens(Meta.lookup, (meta, object) => {
    if (meta === object[Meta.LOOKUP]) {
      return object;
    } else {
      let clone = Semigroup.for(Object).append(object, {});
      clone[Meta.LOOKUP] = meta;
      return clone;
    }
  })
}

function setKey(key, value, object) {
  if (Array.isArray(object)) {
    let clone = object.slice();
    clone[Number(key)] = value;
    return clone;
  } else {
    return Semigroup.for(Object).append(object, {[key]: value});
  }
}

export function Substate(name) {
  let get = context => {
    if (context == null || context[name] == null) {
      return undefined;
    } else {
      return Meta.get(context[name]).source;
    }
  }

  let set = (substate, picostate) => {
    let current = picostate[name];
    let { source } = current ? Meta.get(current) : {};
    if (substate === source) {
      return picostate;
    } else {
      let { path } = Meta.get(picostate);

      var contextualized = Meta.map(meta => ({ source: substate }), substate);

      let whole = append(picostate, {
        [name]: Meta.treemap(meta => ({ path: [name].concat(meta.path) }), contextualized),
        state: setKey(name, substate.state, picostate.state || {})
      })
      let next = Meta.treemap(meta => ({ context: next }), whole);
      return next;
    }
  };

  return Lens(get, set);
}

import { compose, transparent } from './lens';

export function SubstatePath(path = []) {
  return foldl((lens, key) => {
    return compose(lens, Substate(key))
  }, transparent, path);
}


export function parameterized(fn) {

  function initialize(...args) {
    let Type = fn(...args);
    if (Type.initialize) {
      Type.initialize();
    }
    return Type;
  }

  let defaultTypeParameters = new Array(fn.length);
  defaultTypeParameters.fill(Any);
  let DefaultType = initialize(...defaultTypeParameters);
  DefaultType.of = (...args) => initialize(...args);
  return DefaultType;
}
