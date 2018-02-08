import StringType from '../types/string';
import BooleanType from '../types/boolean';
import NumberType from '../types/Number';
import ObjectType from '../types/object';
import ArrayType from '../types/array';

const { getPrototypeOf } = Object;

/**
 * Returns microstate type for a value.
 */
export default function getType(value) {
  let type = typeof value;
  if (type === "function") {
    switch (value) {
      case Number:
        type = "number";
        break;
      case String:
        type = "string";
        break;
      case Boolean:
        type = "boolean";
        break;
      case Object:
        type = "object";
        break;
      case Array:
        type = "array";
        break;
    }
  }
  if (type === "array" || Array.isArray(value)) {
    return ArrayType;
  }
  switch (type) {
    case "number":
      return NumberType;
    case "string":
      return StringType;
    case "boolean":
      return BooleanType;
    case "object":
      let constructor = getPrototypeOf(value).constructor;
      if (value === Object || constructor === Object) {
        return ObjectType;
      } else {
        return constructor;
      }
  }
  return value;
}
