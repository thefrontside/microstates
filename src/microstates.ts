import { IMicrostate, ISchema } from './Interfaces';
import mapTransitions from './utils/mapTransitions';
import stateFor from './utils/stateFor';
import TypeTree from './utils/TypeTree';
import validate from './utils/validate';

export default function microstates(Type: ISchema, initial: any = undefined): IMicrostate {
  validate(Type, `microstates`);

  let tree = new TypeTree(Type);
  let state = stateFor(tree, initial);
  let transitions = mapTransitions(tree, [], function onTransition(transition, ...args) {
    return stateFor(tree, transition(state, ...args));
  });

  return {
    state,
    transitions,
  };
}
