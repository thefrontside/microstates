import { Assemble } from '../assemble';
import { create, Meta } from '../microstates';
import { over } from '../lens';
import { append, filter, foldl } from 'funcadelic';
import parameterized from '../parameterized'

export default parameterized(T => class ObjectType {
  static T = T;

  static get name() {
    return `Object<${T.name}>`;
  }

  static initialize() {
    Assemble.instance(ObjectType, {
      assemble(Type, microstate, value) {
        if (value == null) {
          microstate.state = {};
        }
        return foldl((microstate, entry) => {
          return Object.defineProperty(microstate, entry.key, {
            enumerable: true,
            get() {
              return Meta.mount(this, entry.key, create(T, entry.value));
            }
          })
        }, microstate, microstate.state);
      }
    });
  }

  assign(attrs) {
    return append(this.state, attrs);
  }

  put(name, value) {
    return this.assign({[name]: value});
  }

  delete(name) {
    return filter(({ key }) => key !== name, this.state);
  }
});
