import { Monoid } from 'funcadelic';
import { parameterized } from '../src/types';
import { values } from './values';
import { map } from 'funcadelic';

let ContainsTypes = Monoid.create(class ContainsTypes {
  empty() { return true; }
  append(a, b) {
    return a && (b instanceof Function || isSugar(b));
  }
});

function isPossibleSugar(Type) {
  return Type && (Type.constructor === Array || Type.constructor === Object);
}

export function isSugar(Type) {
  return isPossibleSugar(Type) && ContainsTypes.reduce(values(Type));
}

export default function desugar(Type) {
  if (isSugar(Type)) {
    let { constructor: c } = Type;
    if (c === Array) {
      return parameterized(Array, ...map(desugar, values(Type)));
    }
    if (c === Object) {
      return parameterized(Object, ...map(desugar, values(Type)));
    }
  }
  return Type;
}