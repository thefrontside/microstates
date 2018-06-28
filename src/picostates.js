import { append, Semigroup, map } from 'funcadelic';
import { view, set, over, Lens, SubstatePath } from './lens';

export function create(Type = Any, value) {
  let instance = map((child, name) => {
    let initialized = value ? child.set(value[name]) : child;
    return Meta.map(meta => ({ path: meta.path.concat(name), context: instance }), initialized);
  }, new Type());
  instance.state = value;
  return instance;
}

export class Any {
  set(value) {
    let microstate
    if (value === this.state) {
      microstate = this;
    } else if (value instanceof Any ) {
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
    let context = Meta.treemap(meta => ({
      get context() { return context; }
    }), next);
    return context;
  }
}

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
    let children = map(child => child instanceof Any ? Meta.map(fn, child) : child, object);
    return append(Meta.map(fn, object), children);
  }

  static lookup(object) {
    if (!(object instanceof Any)) {
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
