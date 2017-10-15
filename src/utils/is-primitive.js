import getReducerType from './get-reducer-type';

export default function isPrimitive(type) {
  return getReducerType(type) !== type;
}
