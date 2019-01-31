import { foldl } from 'funcadelic';
import { promap, valueOf, pathOf, Meta } from './meta';
import { methodsOf } from './reflection';

//function composition should probably not be part of lens :)
import { At, view, Path, compose, set } from './lens';

class Location {
  static id = At(Symbol('@id'));
}

export default function Identity(microstate, observe = x => x) {
  let current;
  let identity;
  let pathmap = {};

  function tick(next) {
    update(next);
    observe(identity);
    return identity;
  }

  function update(microstate) {
    current = microstate;
    return identity = promap(proxify, persist, microstate);

    function proxify(microstate) {
      let path = pathOf(microstate);
      let Type = microstate.constructor.Type;
      let value = valueOf(microstate);

      let id = view(compose(Path(path), Location.id), pathmap);

      let Id = id != null && id.constructor.Type === Type ? id.constructor : IdType(Type, path);
      return new Id(value);
    }

    function persist(id) {
      let location = compose(Path(id.constructor.path), Location.id);
      let existing = view(location, pathmap);
      if (!equals(id, existing)) {
        pathmap = set(location, id, pathmap);
        return id;
      } else {
        return existing;
      }
    }
  }

  function IdType(Type, P) {
    class Id extends Type {
      static Type = Type;
      static path = P;
      static name = `Id<${Type.name}>`;

      constructor(value) {
        super(value);
        Object.defineProperty(this, Meta.symbol, { enumerable: false, configurable: true, value: new Meta(this, valueOf(value))});
      }
    }

    let methods = Object.keys(methodsOf(Type)).concat(["set"]);

    Object.assign(Id.prototype, foldl((methods, name) => {
      methods[name] = function(...args) {
        let microstate = view(Path(Id.path), current);

        let next = microstate[name](...args);

        if (next !== current) {
          tick(next);
          return this;
        } else {
          return view(Path(Id.path), pathmap);
        }
      };
      return methods;
    }, {}, methods));

    return Id;
  }
  update(microstate);
  return identity;
}

function equals(id, other) {
  if (other == null) {
    return false;
  } else {
    return other.constructor.Type === id.constructor.Type && valueOf(id) === valueOf(other);
  }
}
