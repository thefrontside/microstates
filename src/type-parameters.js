import { foldl, append } from 'funcadelic';
import toType from './types/to-type';

const TYPE_PARAMETERS = Symbol('Type Parameters');

export function parameterized(Constructor, ...substitutions) {
  let Type = toType(Constructor);
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
    static get [TYPE_PARAMETERS]() { return parameters; };
  };
}

export function params(Constructor) {
  let Type = toType(Constructor);
  return Type[TYPE_PARAMETERS] || {};
}

export const any = Symbol('any');
