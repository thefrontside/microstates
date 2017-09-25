import { IMicrostate, ISchema } from './Interfaces';
import State from './utils/state';
import Transitions from './utils/transitions';
import Tree from './utils/tree';
import validate from './utils/validate';

export default function microstates(Type: ISchema, initial?: any): IMicrostate {
  validate(Type, `microstates`);

  let tree = Tree.from(Type);
  let state = State.from(tree, initial);

  let transitions = Transitions.map(transition => {
    return (...args: any[]) => {
      return transition(state, ...args);
    };
  }, tree);

  return {
    state,
    transitions,
  };
}
