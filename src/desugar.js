import { Monoid } from 'funcadelic';
import { parameterized } from '../src/types';
import { type, map } from 'funcadelic';

const { keys } = Object;
const Values = type(class Values {
  values(holder) {
    return this(holder).values(holder);
  }
})

Values.instance(Array, {
  values(array) { return array; }
});

Values.instance(Object, {
  values(object) { return map(key => object[key], keys(object)); }
});

const { values } = Values.prototype;
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
    return parameterized(Type.constructor, ...map(desugar, values(Type)));
  }
  return Type;
}