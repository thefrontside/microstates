import { map } from 'funcadelic';

import States from './states';
import Transitions from './transitions';
import Tree from './type-tree';
import validate from './utils/validate';

export default class Microstates {
  constructor(tree, value) {
    this.tree = tree;
    this.states = States.from(tree, value);
    this.transitions = map(
      transition => (...args) => transition(this.states, ...args),
      Transitions.from(tree)
    );
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
