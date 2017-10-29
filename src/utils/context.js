import { map, filter } from 'funcadelic';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import Tree from './tree';
import Transitions from './transitions';

/**
 * Return a function that will generate a context object for given type. The returned
 * function expects to receive a value. This value becomes boxed-in by the object. The object
 * has on it transitions for this type. Calling transitions will return another root context
 * object. This makes it possible to invoke transitions using chaining syntax. 
 * valueOf the context object returns the boxed-in value.
 * 
 * ```js
 * class Item {
 *   count = Number;
 * }
 * 
 * let context = ContextFactory(Item);
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
    let context = map(
      // when internal transition is invoked, merge result into current value
      // then create a new context object to allow chaining
      transitions =>
        map(
          t => (...args) => Context(mergeDeepRight(value, t(...args))),
          // to prevent infinite loop, exclude transition that this context is for
          filter(({ key }) => key !== exclude, transitions)
        ),
      Transitions(tree, value)
    ).collapsed;

    // valueOf gives transition handler a way to pull value boxed in this context
    return defineValueOf(context, value);
  };
}

function defineValueOf(object, value) {
  return Object.defineProperty(object, 'valueOf', {
    value() {
      return value;
    },
    enumerable: false,
  });
}
