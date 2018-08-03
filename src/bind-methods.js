import { filter, map } from 'funcadelic'

export default function bindMethods(Type) {
  var descriptors = Object.getOwnPropertyDescriptors(Type.prototype);

  let methodDescriptors = filter(({ key: name, value: desc }) => {
    return name !== 'constructor' && typeof desc.value === 'function';
  }, descriptors);

  let boundMethodDescriptors = map((desc, name) => {
    return {
      configurable: true,
      enumerable: false,
      get() {
        Object.defineProperty(this, name, {
          enumerable: false,
          value: (...args) => {
            return desc.value.apply(this, args);
          }
        })
        return this[name];
      }
    }
  }, methodDescriptors);

  Object.defineProperties(Type.prototype, boundMethodDescriptors);

  return Type;
}
