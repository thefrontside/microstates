import { map, filter, append } from 'funcadelic';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import Tree from './tree';
import Transitions from './transitions';
import States from './states';

/**
 * Return a function that will generate a context object for given type. The returned
 * function expects to receive a value. This value becomes boxed-in by the object. The object
 * has on it transitions for this type. Calling transitions will return another root context
 * object. This makes it possible to invoke transitions using chaining syntax. 
 * valueOf the context object returns the boxed-in value.
 * 
 * ```js
 * class State {
 *   count = Number;
 * }
 * 
 * let context = ContextFactory(State);
 * context({ count: 0 })
 *  .count.increment()
 *  .count.increment()
 *  .count.increment().valueOf();
 * // => { count: 3 }
 * ```
 * 
 * @param {*} Type 
 */
export default function ContextFactory(Type, exclude) {
  let tree = Tree.from(Type);

  return function Context(value) {
    return append(
      map(
        // when internal transition is invoked, merge result into current value
        // then create a new context object to allow chaining
        transitions =>
          map(
            t => (...args) => Context(softMerge(value, t(...args))),
            // to prevent infinite loop, exclude transition that this context is for
            filter(({ key }) => key !== exclude, transitions)
          ),
        Transitions(tree, States(tree, value).collapsed)
      ).collapsed,
      {
        valueOf() {
          return value;
        },
      }
    );
  };
}

/**
 * Merge if b is an object, otherwise return b
 * @param {*} a 
 * @param {*} b 
 */
function softMerge(a, b) {
  if (b && typeof b === 'object') {
    return mergeDeepRight(a, b);
  } else {
    return b;
  }
}
