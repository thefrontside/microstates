import { append, stable, map } from 'funcadelic';
import { set, view, At } from './lens';
import { Meta, mount, metaOf, valueOf, sourceOf } from './meta';
import { methodsOf } from './reflection';
import dsl from './dsl';
import { Relationship, relationship } from './relationship';
import Any from './types/any';
import CachedProperty from './cached-property';
import Observable from './observable';

export function create(InputType = Any, value) {
  let { Type } = dsl.expand(InputType);
  let Microstate = MicrostateType(Type);
  let microstate = new Microstate(value);
  if (hasOwnProperty(Type.prototype, 'initialize')) {
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
        let relationship = slot instanceof Relationship ? slot : legacy(slot);

        return CachedProperty(key, self => {
          let childValue = view(At(key), valueOf(self));
          let { Type, value } = relationship.traverse(childValue, self);
          return mount(self, create(Type, value), key);
        });
      }, this));

      Object.defineProperty(this, Meta.symbol, { enumerable: false, configurable: true, value: new Meta(this, valueOf(value))});
    }
  };

  Object.defineProperties(Microstate.prototype, map((descriptor) => {
    return {
      value(...args) {
        let result = descriptor.value.apply(sourceOf(this), args);
        let meta = metaOf(this);
        let previous = valueOf(meta.root);
        let next = set(meta.lens, valueOf(result), previous);
        if (meta.path.length === 0 && metaOf(result) != null) {
          return result;
        } if (next === previous) {
          return meta.root;
        } else {
          return create(meta.root.constructor, next);
        }
      }
    };
  }, append({ set: { value: x => x } }, methodsOf(Type))));
  return Microstate;
});

/**
 * Implement the legacy DSL as a relationship.
 *
 * Consider emitting a deprecation warning, as this will likely be
 * removed before microstates 1.0
 */

function legacy(object) {
  let cell;
  let meta = metaOf(object);
  if (meta != null) {
    cell = { Type: object.constructor.Type, value: valueOf(object) };
  } else {
    cell = dsl.expand(object);
  }
  let { Type } = cell;
  return relationship(cell.value).map(({ value }) => ({ Type, value }));
}

function hasOwnProperty(target, propertyName) {
  return Object.prototype.hasOwnProperty.call(target, propertyName);
}