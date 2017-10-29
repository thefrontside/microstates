import { map } from 'funcadelic';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import Tree from './tree';
import Transitions from './transitions';

export default function contextFactory(Type) {
  let tree = Tree.from(Type);

  return function Context(value) {
    let context = map(
      // when internal transition is invoked, merge result into current value
      // then create a new context object to allow chaining
      transitions => map(t => (...args) => Context(mergeDeepRight(value, t(...args))), transitions),
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
