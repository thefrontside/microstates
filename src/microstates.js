import { append, map } from 'funcadelic';
import lensPath from 'ramda/src/lensPath';

import gettersFor from './utils/getters-for';
import initialize from './utils/initialize';
import isPrimitive from './utils/is-primitive';
import transitionsFor from './utils/transitions-for';
import Tree from './utils/tree';
import validate from './utils/validate';

export default class Microstates {
  constructor(tree, value) {
    let values = map(data => append(data, { value: initialize(data, value) }), tree);

    this.states = map(
      ({ Type, value }) => (isPrimitive(Type) ? value : append(value, gettersFor(Type))),
      values
    ).collapsed;

    // raw, uncurried transitions
    let rawTransitions = map(
      ({ Type, path }) => ({ path, transitions: transitionsFor(Type) }),
      tree
    );

    // curry in the lens and value
    let curriedTransitions = map(
      ({ path, transitions }) =>
        map(t => (...args) => t(lensPath(path), value, ...args), transitions),
      rawTransitions
    );

    this.transitions = curriedTransitions.collapsed;
  }
  /**
   * Create new Microstates for same type tree but new value.
   * @param value any
   */
  to(value) {
    return new Microstates(this.tree, value);
  }
  /**
   * Build Microstates for given type and value.
   * @param Type Tree
   * @param value any
   */
  static from(Type, value) {
    validate(Type, `microstates`);
    return new Microstates(Tree.from(Type), value);
  }
}
