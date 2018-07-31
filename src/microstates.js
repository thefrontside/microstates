import { append, foldl, Semigroup, map, stable } from 'funcadelic';
import { view, set, over, Lens, ValueAt } from './lens';
import Identity from './identity';
import { Hash } from './hash';
import { Assemble, assemble } from './assemble';
import SymbolObservable from 'symbol-observable';
import sugar from './sugar';
import Any from './types/any'
import { treemap } from './tree';

export function create(InputType = Any, value) {
  let Type = sugar.desugarType(InputType);
  let PicoType = toPicoType(Type);
  let instance = new PicoType();
  instance.state = value
  let microstate = assemble(Type, instance, value);

  if (Type.prototype.hasOwnProperty('initialize') && typeof microstate.initialize === 'function') {
    return microstate.initialize(value);
  } else {
    return microstate;
  }
}

const toPicoType = stable(function toPicoType(Type) {
  if (Type.isMicrostateType) {
    return Type;
  }
  let PicoType = class extends Type {
    static name = `Microstate<${Type.name}>`;
    static Type = Type;
    static isMicrostateType = true;

    set(value) {
      let microstate
      if (value === this.state) {
        microstate = this;
      } else if (isMicrostate(value)) {
        microstate = value;
      } else {
        microstate = create(this.constructor, value);
      }
      let meta = Meta.get(this);
      return set(meta.lens, microstate, meta.context);
    }

    [SymbolObservable]() { return this['@@observable'](); }
    ['@@observable']() {
      return {
        subscribe: (observer) => {
          let next = observer.call ? observer : observer.next.bind(observer);
          return Identity(this, next);
        },
        [SymbolObservable]() {
          return this;
        }
      };
    }

  }

  Hash.instance(PicoType, {
    digest(microstate) {
      return [microstate.state];
    }
  })

  let descriptors = Object.getOwnPropertyDescriptors(Type.prototype);
  let methods = Object.keys(descriptors).reduce((methods, name) => {
    let desc = descriptors[name];
    if (name !== 'constructor' && name !== 'set' && typeof name === 'string' && typeof desc.value === 'function') {
      return methods.concat(name);
    } else {
      return methods;
    }
  }, []);

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

export function isMicrostate(value) {
  return value != null && value.constructor.isMicrostateType;
}

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

  static source(microstate) {
    return Meta.get(microstate).source || microstate;
  }

  static update(fn, object) {
    return over(Meta.lens, meta => append(meta, fn(meta)), object);
  }

  static treemap(fn, object) {
    return treemap(isMicrostate, x => x, microstate => this.update(fn, microstate), object);
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
      Object.defineProperty(clone, Meta.LOOKUP, {
        configurable: true,
        value: meta
      });
      return clone;
    }
  })
}

export function SubstateAt(name) {
  let getter = context => {
    if (context == null || context[name] == null) {
      return undefined;
    } else {
      return Meta.get(context[name]).source;
    }
  }

  let setter = (substate, microstate) => {
    let current = microstate[name];
    let { source } = current ? Meta.get(current) : {};
    if (substate === source) {
      return microstate;
    } else {
      let contextualized = Meta.update(() => ({ source: substate }), substate);

      let whole = append(microstate, {
        [name]: Meta.treemap(meta => ({ path: [name].concat(meta.path) }), contextualized),
        state: set(ValueAt(name), substate.state, microstate.state)
      });
      let next = Meta.treemap(() => ({ get context() { return next; } }), whole);
      return next;
    }
  };

  return Lens(getter, setter);
}

import { compose, transparent } from './lens';

export function SubstatePath(path = []) {
  return foldl((lens, key) => {
    return compose(lens, SubstateAt(key))
  }, transparent, path);
}


function desugarProperty(value) {
  if (isMicrostate(value)) {
    return value;
  } else {
    let Type = sugar.desugarType(value);
    return create(Type, typeof value === 'function' ? undefined : value);
  }
}

Assemble.instance(Object, {
  assemble(Type, microstate, value) {
    return foldl((microstate, { key, value: child }) => {
      let substate = value != null && value[key] != null ? child.set(value[key]) : child;
      return set(SubstateAt(key), substate, microstate)
    }, microstate, map(desugarProperty, new Type()));
  }
})
