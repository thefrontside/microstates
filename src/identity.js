import { map, foldl } from 'funcadelic';
import { Meta } from './microstates';
import parameterized from './parameterized';
import { Hash, equals } from './hash';

//function composition should probably not be part of lens :)
import { over, view, set, Path, ValueAt, compose } from './lens';

class PathMap {
  constructor() {
    this.microstate = ValueAt(Symbol('@microstate'));
    this.id = ValueAt(Symbol('@id'));
    this.paths = {};
  }

  getIdAt(path) {
    return view(compose(Path(path), this.id), this.paths);
  }

  getMicrostateAt(path) {
    return view(compose(Path(path), this.microstate), this.paths);
  }

  setPath(path, id, microstate) {
    let _path = Path(path);

    this.paths = set(compose(_path, this.id), id, this.paths);
    this.paths = set(compose(_path, this.microstate), microstate, this.paths);
  }
}

function tmap(fn, object, path = []) {
  if (!isMicrostate(object)) {
    return object;
  } else {
    var next = fn(object, path);
    if (next === object) {
      return object;
    } else {
      return foldl((result, entry) => {
        if (entry.key === 'state') {
          return result;
        }
        return Object.defineProperty(result, entry.key, {
          configurable: true,
          get() {
            Object.defineProperty(this, entry.key, {
              value: tmap(fn, entry.value, path.concat(entry.key))
            });
            return this[entry.key];
          }
        });
      }, next, object);
    }
  }
}

export default function Identity(microstate, observe = x => x) {
  let current;
  let identity;
  let paths = new PathMap();

  function tick(next) {
    update(next);
    observe(identity);
    return identity;
  }

  function update(microstate) {
    current = microstate;

    identity = tmap((microstate, path) => {
      let proxy = paths.getIdAt(path);
      let Type = microstate.constructor.Type;
      let value = microstate.state;
      if (proxy == null || !equals(proxy, microstate)) {
        let IdType;
        if (proxy && proxy.constructor.Type === Type) {
          IdType = proxy.constructor;
        } else {
          IdType = Id.of(Type, path);
        }
        proxy = new IdType(value);
      }
      paths.setPath(path, proxy, microstate);
      return proxy;
    }, microstate);
  }

  let Id = parameterized((T, P) => class Id extends T {
    static Type = T;
    static name = `Id<${T.name}>`;

    static initialize() {
      let descriptors = Object.getOwnPropertyDescriptors(T.prototype);

      let methods = Object.keys(descriptors).reduce((methods, name) => {
        let desc = descriptors[name];
        if (name !== 'constructor' && typeof name === 'string' && typeof desc.value === 'function') {
          return methods.concat(name);
        } else {
          return methods;
        }
      }, ["set"]);

      Object.assign(this.prototype, foldl((methods, name) => {
        methods[name] = function(...args) {
          let path = P;
          let microstate = paths.getMicrostateAt(path);
          let next = microstate[name](...args);

          return next === current ? identity : tick(next);
        }
        return methods;
      }, {}, methods));

      Object.keys(descriptors).forEach(propertyName => {
        let desc = descriptors[propertyName];
        if (typeof propertyName === 'string' && typeof desc.get === 'function') {
          Object.defineProperty(this.prototype, propertyName, {
            get() {
              let value = desc.get.call(this);
              Object.defineProperty(this, propertyName, { value });
              return value;
            }
          })
        }
      })

      Hash.instance(this, {
        digest(id) {
          return [id.state];
        }
      })
    }

    constructor(value) {
      super();
      this.state = value;
    }
  })

  return tick(microstate);
}

function isMicrostate(object) {
  return object != null && object.constructor.isMicrostateType;
}
