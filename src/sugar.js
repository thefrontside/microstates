import { Monoid } from 'funcadelic';
import { parameterized } from '../src/types';

const { keys } = Object;

let ContainsTypes = Monoid.create(class ContainsTypes {
  empty() { return true; }
  append(a, b) {
    // this is necessary because Funcadelic passes different arguments
    // for arrays than objects. For arrays, value is just the value and 
    // for Objects it's Monoidic with {value}. 
    // I think it's a bug in Funcadelic.
    let value = b && b.value || b;
    return a && (value instanceof Function || isPossibleSugar(value) && isSugar(value));
  }
});

function isPossibleSugar(Type) {
  return Type && (Type.constructor === Array || Type.constructor === Object);
}

export function isSugar(Type) {
  return isPossibleSugar(Type) && ContainsTypes.reduce(Type);
}

export function desugar(Type) {
  let { constructor: c } = Type;
  if (c === Array) {
    return parameterized(Array, ...Type.map(desugar));
  }
  if (c === Object) {
    return parameterized(Object, ...keys(Type).map(k => desugar(Type[k])));
  }
  return Type;
}