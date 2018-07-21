import { map, foldl } from 'funcadelic';
import { Meta } from './microstates';
import Tree from './tree';
import parameterized from './parameterized';

//function composition should probably not be part of lens :)
import { compose, view, Path } from './lens';

const info = Symbol('info');

export default function Identity(microstate, observe = x => x) {
  let current;
  let identity;
  let tick = compose(observe, update);

  function update(microstate) {
    current = microstate;

    return identity = map(microstate => {
      let { path } = Meta.get(microstate);
      let proxy = view(Path(path), identity);
      let Type = microstate.constructor.base;
      let value = microstate.state;
      if (proxy == null || Type !== proxy[info].Type || value !== proxy.state) {
        let IdType = Id.of(Type)
        return new IdType(value, path);
      } else {
        return proxy
      }
    }, Tree(microstate)).object;
  }

  let Id = parameterized(T => class Id extends T {
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
          let microstate = view(Path(path), current);
          let next = microstate[name](...args);
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

  return tick(microstate);
}
