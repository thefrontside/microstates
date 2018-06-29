import { append, filter, foldl, Semigroup, map, stable } from 'funcadelic';
import { view, set, over, Lens, SubstatePath } from './lens';

export function create(Type = Any, value) {
  let PicoType = toPicoType(Type);
  let instance = map((child, name) => {
    let initialized = value ? child.set(value[name]) : child;
    return Meta.map(meta => ({ path: meta.path.concat(name), context: instance }), initialized);
  }, new PicoType());
  instance.state = value;
  let context = Meta.treemap(meta => ({ context }), instance);
  return context;
}

const toPicoType = stable(function toPicoType(Type) {
  if (Type.isPicostateType) {
    return Type;
  }
  let PicoType = class extends Type {
    static get name() {
      return `Picostate<${Type.name}>`;
    }
    static get isPicostateType() {
      return true;
    }

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
      let next = set(meta.lens, microstate, meta.context);
      if (next === microstate) {
        return microstate;
      }
      //set the root context across the entire tree.
      let context = Meta.treemap(meta => ({ context }), next);
      return context;
    }
  }
  let methods = filter(name => name !== 'constructor' && name !== 'set' && typeof Type.prototype[name] === 'function', Object.getOwnPropertyNames(Type.prototype));

  Object.assign(PicoType.prototype, foldl((methods, name) =>  {
    methods[name] = function(...args) {
      let method = Type.prototype[name];
      let local = create(this.constructor, this.state);
      let result = method.apply(local, args);
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
    return view(Meta.lens, object);
  }

  static map(fn, object) {
    return over(Meta.lens, meta => append(meta, fn(meta)), object);
  }

  static treemap(fn, object) {
    let children = map(child => isPicostate(child) ? Meta.treemap(fn, child) : child, object);
    return append(Meta.map(fn, object), children);
  }

  static lookup(object) {
    if (!(isPicostate(object))) {
      throw new Error(`Tried to retrieve metadata from '${object}' which is not a picostate`);
    }
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
