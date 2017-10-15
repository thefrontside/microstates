import ArrayState from '../primitives/array';
import BooleanState from '../primitives/boolean';
import NumberState from '../primitives/number';
import ObjectState from '../primitives/object';
import StringState from '../primitives/string';

export default function getReducerType(type) {
  switch (type) {
    case String:
      return StringState;
    case Number:
      return NumberState;
    case Boolean:
      return BooleanState;
    case Object:
      return ObjectState;
    case Array:
      return ArrayState;
  }
  return type;
}
