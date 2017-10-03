import ComputedProperty from './computed-property';

export default function defineComputedProperty(object, name, callback, attributes) {
  return Object.defineProperty(object, name, new ComputedProperty(callback, attributes));
}
