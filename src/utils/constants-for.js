import { map, filter } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

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
  let descriptors = filter(
    ({ value }) => typeof value.value !== 'function',
    getOwnPropertyDescriptors(new Type())
  );

  return Object.create(
    Object.prototype,
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
