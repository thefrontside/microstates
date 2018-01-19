import { Functor, map } from 'funcadelic';
import { Microstate } from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';

Functor.instance(Microstate, {
  map(fn, microstate) {
    let { transitions } = reveal(microstate);
    return map(transitions => map(transition => fn(transition), transitions), transitions)
      .collapsed;
  },
});

Functor.instance(Tree, {
  /**
   * Lazily invoke callback on every property of given tree,
   * the return value is assigned to property value.
   *
   * @param {*} fn (TypeTree, path) => any
   * @param {*} tree Tree
   */
  map(fn, tree) {
    return new Tree({
      data() {
        return fn(tree.data);
      },
      children() {
        return map(child => map(fn, child), tree.children);
      },
    });
  },
});
