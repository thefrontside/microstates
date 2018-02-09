import { foldl, append } from 'funcadelic';

const TYPE_PARAMETERS = Symbol('Type Parameters');

export function parameterized(Class, ...substitutions) {
  let defaults = params(Class);
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

  return class Parameterized extends Class {
    static [TYPE_PARAMETERS] = parameters;
  };
}

export function params(Class) {
  return Class[TYPE_PARAMETERS] || {};
}
