import { map, foldl } from 'funcadelic';
import { Meta } from './microstates';
import { treemap } from './tree';
import parameterized from './parameterized';
import { Hash, equals } from './hash';

//function composition should probably not be part of lens :)
import { view, Path } from './lens';

export default function Identity(microstate, observe = x => x) {
  let current;
  let identity;

  function tick(next) {
    update(next);
    observe(identity);
    return identity;
  }

  function update(microstate) {
    current = microstate;

    return identity = treemap(isMicrostate, x => x, (microstate, path) => {
      let proxy = view(Path(path), identity);
      let Type = microstate.constructor.Type;
      let value = microstate.state;
      if (proxy == null || !equals(proxy, microstate)) {
        let IdType;
        if (proxy && proxy.constructor.Type === Type) {
          IdType = proxy.constructor;
        } else {
          IdType = Id.of(Type, path);
        }
        return new IdType(value);
      } else {
        return proxy
      }
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
          let microstate = view(Path(path), current);
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
