import { Assemble } from '../assemble';
import { SubstateAt, create } from '../microstates';
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
          return over(SubstateAt(entry.key), () => create(T).set(entry.value), microstate );
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
