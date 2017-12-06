import { map, filter } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { keep, reveal } from './secret';

/**
 * Returns an object with constants from a type as getters.
 *
 * For example,
 *
 * ```js
 * constantsFor(class {
 *   isPending = true;
 *   isNew = false;
 * })
 * //=> {
 * //  get isPending() { return true; }
 * //  get isNew() { return false; }
 * // }
 * ```
 *
 * @param {*} Type
 */
export default function constantsFor(Type) {
  let instance = reveal(Type);
  if (!instance) {
    instance = new Type();
    keep(Type, instance);
  }

  let descriptors = filter(
    ({ value }) => typeof value.value !== 'function',
    getOwnPropertyDescriptors(instance)
  );

  return Object.create(
    Type.prototype,
    map(
      descriptor => ({
        get() {
          return descriptor.value;
        },
        enumerable: true,
      }),
      descriptors
    )
  );
}
