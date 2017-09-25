import { ISchema, ITransitionMap } from './Interfaces';
import States from './utils/state';
import Transitions from './utils/transitions';
import Tree from './utils/tree';
import validate from './utils/validate';

export default class Microstates {
  private tree: Tree;
  public transitions: ITransitionMap;
  public states: States;

  constructor(params: { tree: Tree; transitions: ITransitionMap; states: States }) {
    this.tree = params.tree;
    this.transitions = params.transitions;
    this.states = params.states;
  }

  static from(Type: ISchema, initial?: any): Microstates {
    validate(Type, `microstates`);

    let tree = Tree.from(Type);

    let states = States.from(tree, initial);

    let transitions = Transitions.map(transition => {
      return (...args: any[]) => {
        return transition(states, ...args);
      };
    }, tree);

    return new Microstates({ tree, transitions, states });
  }
}
