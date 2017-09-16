import { IMicrostate, ISchema } from './Interfaces';
import TypeTree from './utils/TypeTree';
import validate from './utils/validate';
import stateFor from './utils/stateFor';
import transitionsFor from './utils/transitionsFor';

export default function microstates(Type: ISchema, initial: any = undefined): IMicrostate {
  validate(Type, `microstates`);

  let tree = new TypeTree(Type);
  let state = stateFor(tree, initial);
  let transitions = transitionsFor(tree, function onTransition(transition, ...args) {
    return stateFor(tree, transition(state, ...args));
  });

  return {
    state,
    transitions,
  };
}
