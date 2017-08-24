import ComputedProperty from './ComputedProperty';

export default function defineComputedProperty(
  object: {},
  name: string,
  callback: () => any,
  attributes: {}
) {
  Object.defineProperty(object, name, new ComputedProperty(callback, attributes));
}
