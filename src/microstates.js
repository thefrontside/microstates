import Tree from './utils/tree';
import States from './utils/states';
import Transitions from './utils/transitions';
import validate from './utils/validate';

export default class Microstates {
  constructor(tree, value) {
    this.states = States(tree, value).collapsed;
    this.transitions = Transitions(tree, this.states).collapsed;
    this.tree = tree;
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
