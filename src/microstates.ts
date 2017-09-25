import { ISchema, ITransitionMap } from './Interfaces';
import States from './utils/state';
import Transitions from './utils/transitions';
import Tree from './utils/tree';
import validate from './utils/validate';

export default class Microstates {
  private tree: Tree;
  public transitions: ITransitionMap;
  public states: States;

  constructor(tree: Tree, value: any) {
    this.tree = tree;
    this.states = States.from(tree, value);
    this.transitions = Transitions.map(
      transition => (...args: any[]) => transition(this.states, ...args),
      tree
    );
  }

  /**
   * Create new Microstates for same type tree but new value.
   * @param value any
   */
  to(value: any): Microstates {
    return new Microstates(this.tree, value);
  }

  /**
   * Build Microstates for given type and value.
   * @param Type Tree
   * @param value any 
   */
  static from(Type: ISchema, value?: any): Microstates {
    validate(Type, `microstates`);
    return new Microstates(Tree.from(Type), value);
  }
}
