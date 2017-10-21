import getType from './get-type';

export default function isPrimitive(type) {
  return getType(type) !== type;
}
