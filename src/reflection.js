import { filter } from 'funcadelic';

const { getPrototypeOf, getOwnPropertyDescriptors, assign } = Object;

export function methodsOf(Type) {
  return filter(({ key: name, value: desc }) => {
    return name !== 'constructor' && typeof name === 'string' && typeof desc.value === 'function';
  }, getAllPropertyDescriptors(Type.prototype));
}

/**
 * As opposed to `getOwnPropertyDescriptors` which only gets the
 * descriptors on a single object, `getAllPropertydescriptors` walks
 * the entire prototype chain starting at `prototype` and gather all
 * descriptors that are accessible to this object.
 */
function getAllPropertyDescriptors(object) {
  if (object === Object.prototype) {
    return {};
  } else {
    let prototype = getPrototypeOf(object);
    return assign(getAllPropertyDescriptors(prototype), getOwnPropertyDescriptors(object));
  }
}
