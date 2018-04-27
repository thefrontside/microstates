import { foldl, append } from 'funcadelic';

const TYPE_PARAMETERS = Symbol('Type Parameters');

export function parameterized(Type, ...substitutions) {
  let defaults = params(Type);
  let keys = Object.keys(defaults);
  let parameters = foldl((parameters, param, index) => {
    if (typeof param === 'function') {
      let key = keys[index];
      if (key) {
        return append(parameters, {[key]: param});
      } else {
        return parameters;
      }
    } else {
      return append(parameters, param);
    }
  }, defaults, substitutions);

  return class Parameterized extends Type {
    static get name() { return Type.name; }
    static get toString() {
      let names = Object.keys(parameters).map(k => {
        let parameter = parameters[k];
        if (Object.keys(params(parameter)).length) {
          return parameter.toString();
        }
        if (parameter.name != null) {
          return parameter.name;
        } else {
          return parameter.toString();
        }
      });
      return () => `${Type.name}<${names.join(',')}>`;
    }
    static get [TYPE_PARAMETERS]() { return parameters; }
  };
}

export function params(Constructor) {
  return Constructor[TYPE_PARAMETERS] || {};
}