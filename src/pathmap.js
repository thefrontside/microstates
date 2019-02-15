import { methodsOf } from './reflection';
import { create } from './microstates';
import { view, Path } from './lens';
import { valueOf, Meta } from './meta';
import { defineChildren } from './tree';
import { stable } from 'funcadelic';

import Storage from './storage';
// TODO: explore compacting non-existent locations (from removed arrays and objects).

export default function Pathmap(Root, ref) {
  let paths = new Storage();

  class Location {

    static symbol = Symbol('Location');

    static allocate(path) {
      let existing = paths.getPath(path.concat(Location.symbol));
      if (existing) {
        return existing;
      } else {
        let location = new Location(path);
        paths.setPath(path, { [Location.symbol]: location });
        return location;
      }
    }

    get currentValue() {
      return view(this.lens, ref.get());
    }

    get reference() {
      if (!this.currentReference || (this.currentValue !== valueOf(this.currentReference))) {
        return this.currentReference = this.createReference();
      } else {
        return this.currentReference;
      }
    }

    get microstate() {
      return view(this.lens, create(Root, ref.get()));
    }

    constructor(path) {
      this.path = path;
      this.lens = Path(path);
      this.createReferenceType = stable(Type => {
        let location = this;
        let typeName = Type.name ? Type.name: 'Unknown';

        class Reference extends Type {
          static name = `Ref<${typeName}>`;
          static location = location;

          constructor(value) {
            super(value);
            Object.defineProperty(this, Meta.symbol, { enumerable: false, configurable: true, value: new Meta(this, valueOf(value))});
            defineChildren(key => Location.allocate(path.concat(key)).reference, this);
          }
        }

        for (let methodName of Object.keys(methodsOf(Type)).concat("set")) {
          Reference.prototype[methodName] = (...args) => {
            let microstate = location.microstate;
            let next = microstate[methodName](...args);
            ref.set(valueOf(next));
            return location.reference;
          };
        }

        return Reference;
      });
    }

    createReference() {
      let { Type } = this.microstate.constructor;
      let Reference = this.createReferenceType(Type);

      return new Reference(this.currentValue);
    }

    get(reference = paths.getPath([Location.symbol, 'reference'])) {
      return reference.constructor.location.reference;
    }
  }

  return Location.allocate([]);
}
