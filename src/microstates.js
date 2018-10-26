import { stable, map } from 'funcadelic';
import { set } from './lens';
import { Meta, mount, metaOf, valueOf, sourceOf } from './meta';
import { methodsOf } from './reflection';
import dsl from './dsl';
import Any from './types/any';
import CachedProperty from './cached-property';
import Observable from './observable';

export function create(InputType = Any, value) {
  let { Type } = dsl.expand(InputType);
  let Microstate = MicrostateType(Type);
  let microstate = new Microstate(value);
  if (Type.prototype.hasOwnProperty('initialize')) {
    return microstate.initialize(value);
  } else {
    return microstate;
  }
}

const MicrostateType = stable(function MicrostateType(Type) {
  if (Type.Type) {
    return Type;
  }
  let Microstate = class extends Observable(Type) {
    static name = `Microstate<${Type.name}>`;
    static Type = Type;

    constructor(value) {
      super(value);
      Object.defineProperties(this, map((slot, key) => {
        return CachedProperty(key, self => {
          let value = valueOf(self);
          let expanded = expandProperty(slot);
          let substate = value != null && value[key] != null ? expanded.set(value[key]) : expanded;
          let mounted = mount(self, substate, key);
          return mounted;
        });
      }, this));

      Object.defineProperty(this, Meta.symbol, { enumerable: false, configurable: true, value: new Meta(this, valueOf(value))});
    }

    set(object) {
      let meta = metaOf(this);
      let previous = valueOf(meta.root);
      let next = set(meta.lens, valueOf(object), previous);
      if (meta.path.length === 0 && metaOf(object) != null) {
        return object;
      } if (next === previous) {
        return meta.root;
      } else {
        return create(meta.root.constructor, next);
      }
    }
  };
  Object.defineProperties(Microstate.prototype, map((descriptor) => {
    return {
      value(...args) {
        let result = descriptor.value.apply(sourceOf(this), args);
        return this.set(result);
      }
    };
  }, methodsOf(Type)));
  return Microstate;
});

function expandProperty(property) {
  let meta = metaOf(property);
  if (meta != null) {
    return property;
  } else {
    let { Type, value } = dsl.expand(property);
    return create(Type, value);
  }
}
