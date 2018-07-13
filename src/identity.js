import { map, foldl } from 'funcadelic';
import { create, Meta } from './picostates';
import Tree from './tree';
import parameterized from './parameterized';

//function composition should probably not be part of lens :)
import { compose, view, Path } from './lens';

const info = Symbol('info');

export default function Identity(picostate, observe = x => x) {
  let current;
  let identity;
  let tick = compose(observe, update);

  function update(picostate) {
    current = picostate;

    return identity = map(picostate => {
      let { path } = Meta.get(picostate);
      let proxy = view(Path(path), identity);
      let Type = picostate.constructor.base;
      let value = picostate.state;
      if (proxy == null || Type !== proxy[info].Type || value !== proxy.state) {
        let ProxyType = Proxy.of(Type)
        return new ProxyType(value, path);
      } else {
        return proxy
      }
    }, Tree(picostate)).object;
  }

  let Proxy = parameterized(T => class Proxy extends T {
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
          let { path } = this[info];
          let picostate = view(Path(path), current);
          let next = picostate[name](...args);
          return tick(next);
        }
        return methods;
      }, {}, methods));
    }

    constructor(value, path) {
      super();
      this.state = value;
      this[info] = { Type: T, path };
    }

  })

  return tick(picostate);
}
