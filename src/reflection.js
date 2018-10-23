import { filter } from 'funcadelic';

export function methodsOf(Type) {
  return filter(({ key: name, value: desc }) => {
    return name !== 'constructor' && name !== 'set' && typeof name === 'string' && typeof desc.value === 'function';
  }, Object.getOwnPropertyDescriptors(Type.prototype));
}
