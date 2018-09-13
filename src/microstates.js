import { append, foldl, Semigroup, map, stable } from 'funcadelic';
import { compose, view, set, over, transparent, Lens, ValueAt } from './lens';
import Identity from './identity';
import { Hash } from './hash';
import { Assemble, assemble } from './assemble';
import SymbolObservable from 'symbol-observable';
import Any from './types/any'
import dsl from './dsl';
import { treemap } from './tree';

export function create(InputType = Any, value) {
  let { Type } = dsl.expand(InputType);
  let Microstate = toMicrostateType(Type);
  let instance = new Microstate();
  instance.state = value
  let microstate = assemble(Type, instance, value);

  if (Type.prototype.hasOwnProperty('initialize') && typeof microstate.initialize === 'function') {
    return microstate.initialize(value);
  } else {
    return microstate;
  }
}

const toMicrostateType = stable(function toMicrostateType(Type) {
  if (Type.isMicrostateType) {
    return Type;
  }
  let Microstate = class extends Type {
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
      return set(meta.lens, Meta.source(microstate), meta.context);
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

  Hash.instance(Microstate, {
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

  Object.assign(Microstate.prototype, foldl((methods, name) =>  {
    methods[name] = function(...args) {
      let method = Type.prototype[name];
      let meta = Meta.get(this);
      let result = method.apply(meta.source || this, args);
      return this.set(result);
    }
    return methods;
  }, {}, methods))
  return Microstate;
});

export function isMicrostate(value) {
  return value != null && value.constructor.isMicrostateType;
}

export class Meta {
  constructor(attrs = {}) {
    this.path = attrs.hasOwnProperty('path') ? attrs.path : [];
    this.context = attrs.hasOwnProperty('context') ? attrs.context : undefined;
    this.lens = attrs.hasOwnProperty('lens') ? attrs.lens : transparent;
  }

  static get(object) {
    if (object == null) {
      throw new Error('cannot lookup Meta of null or undefined');
    }
    return view(Meta.lens, object);
  }

  static At(key) {
    function getter(microstate) {
      if (microstate == null || microstate[key] == null) {
        return undefined;
      } else {
        return Meta.get(microstate[key]).source;
      }
    }
    function setter(substate, microstate) {
      let current = microstate[key];
      let { source } = current ? Meta.get(current) : {};
      if (substate === source) {
        return microstate;
      } else {
        return append(microstate, {
          state: set(ValueAt(key), substate.state, microstate.state),
          get [key]() {
            return Meta.mount(this, key, substate);
          }
        })
      }
    }
    return Lens(getter, setter);
  }

  static mount(microstate, property, substate) {
    let parent = Meta.get(microstate);
    let prefix = compose(parent.lens, Meta.At(property))
    return Meta.treemap(meta => {
      return {
        get context() {
          return parent.context;
        },
        get lens() {
          return compose(prefix, meta.lens);
        },
        get path() {
          return [property].concat(meta.path);
        }
      }
    }, Meta.update(() => ({ source: substate }), substate));
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

function expandProperty(property) {
  if (isMicrostate(property)) {
    return property;
  } else {
    let { Type, value } = dsl.expand(property);
    return create(Type, value);
  }
}

Assemble.instance(Object, {
  assemble(Type, microstate, value) {
    let slots = map(expandProperty, new Type());

    return foldl((microstate, slot) => {
      let key = slot.key;
      let subvalue = value != null ? value[key] : undefined
      let substate = subvalue != null ? slot.value.set(subvalue) : slot.value;
      return set(Meta.At(key), substate, microstate);
    }, microstate, slots);
  }
})
