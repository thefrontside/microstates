import { append, filter, foldl, Semigroup, map, stable, type } from 'funcadelic';
import { view, set, over, Lens, ValueAt } from './lens';
import Identity from './identity';
import { Assemble, assemble } from './assemble';
import SymbolObservable from 'symbol-observable';
import sugar from './sugar';
import Any from './types/any'

export function create(InputType = Any, value) {
  let Type = sugar.desugarType(InputType);
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
    static name = `Picostate<${Type.name}>`;
    static base = Type;
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

export function isPicostate(value) {
  return value != null && value.constructor.isPicostateType;
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

export function SubstateAt(name) {
  let getter = context => {
    if (context == null || context[name] == null) {
      return undefined;
    } else {
      return Meta.get(context[name]).source;
    }
  }

  let setter = (substate, picostate) => {
    let current = picostate[name];
    let { source } = current ? Meta.get(current) : {};
    if (substate === source) {
      return picostate;
    } else {
      let { path } = Meta.get(picostate);

      var contextualized = Meta.map(meta => ({ source: substate }), substate);

      let whole = append(picostate, {
        [name]: Meta.treemap(meta => ({ path: [name].concat(meta.path) }), contextualized),
        state: set(ValueAt(name), substate.state, picostate.state)
      })
      let next = Meta.treemap(meta => ({ context: next }), whole);
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
  if (isPicostate(value)) {
    return value;
  } else {
    let Type = sugar.desugarType(value);
    return create(Type, value);
  }
}

Assemble.instance(Object, {
  assemble(Type, picostate, value) {
    return foldl((picostate, { key, value: child }) => {
      let substate = value != null && value[key] != null ? child.set(value[key]) : child;
      return set(SubstateAt(key), substate, picostate)
    }, picostate, map(desugarProperty, new Type()));
  }
})
