import { methodsOf } from './reflection';
import { create } from './microstates';
import { compose, view, At, Path } from './lens';
import { valueOf, Meta, childAt, defineChildren } from './meta';
import { stable } from 'funcadelic';

import Storage from './storage';
// TODO: explore compacting non-existent locations (from removed arrays and objects).

const SymbolLocation = Symbol('Location');
const LocationLens = compose(At(SymbolLocation), At('reference'));

export function current(reference) {
  return reference.constructor.location.reference;
}

export function idOf(pathmap) {
  return view(LocationLens, pathmap);
}

export default function Pathmap(Root, ref) {
  let paths = new Storage();

  class Location {

    static allocate(path, parent) {
      let existing = paths.getPath(path.concat(SymbolLocation));
      if (existing) {
        return existing;
      } else {
        let location = new Location(path, parent);
        paths.setPath(path, { [SymbolLocation]: location });
        return location;
      }
    }

    get currentValue() {
      return view(this.lens, ref.get());
    }

    // TODO: this is only to support a deprecated API
    get root() {
      if (this.parent == null) {
        return this.reference;
      } else {
        return this.parent.root;
      }
    }

    get reference() {
      if (!this.currentReference || (this.currentValue !== this.previousValue)) {
        return this.currentReference = this.createReference();
      } else {
        return this.currentReference;
      }
    }

    get microstate() {
      if (this.parent == null) {
        return create(Root, this.currentValue);
      } else {
        let [ key ] = this.path.slice(-1);
        let { microstate } = this.parent;
        return childAt(key, microstate);
      }
    }

    constructor(path = [], parent = null) {
      this.path = path;
      this.parent = parent;
      this.lens = Path(path);
      this.previousValue = this.currentValue;
      this.createReferenceType = stable(Type => {
        let location = this;
        let typeName = Type.name ? Type.name: 'Unknown';

        class Reference extends Type {
          static name = `Ref<${typeName}>`;
          static location = location;

          constructor(value) {
            super(value);
            defineChildren(key => Location.allocate(path.concat(key), location).reference, this);
            Object.defineProperty(this, Meta.symbol, { enumerable: false, configurable: true, value: new Meta(this, valueOf(value))});
          }
        }

        for (let methodName of Object.keys(methodsOf(Type)).concat("set")) {
          Reference.prototype[methodName] = (...args) => {
            let microstate = location.microstate;
            let next = microstate[methodName](...args);
            ref.set(valueOf(next));
            // TODO: this is what we actually want.
            // return location.reference;
            return location.root;
          };
        }

        return Reference;
      });
    }

    createReference() {
      this.previousValue = this.currentValue;
      // TODO: polymorphically fetch typeOf()
      let { Type } = this.microstate.constructor;
      let Reference = this.createReferenceType(Type);
      return new Reference(this.currentValue);
    }
  }
  Location.allocate([], null);
  return paths.get();
}
