import { IMicrostate, ISchema } from './Interfaces';
import TypeTree from './utils/TypeTree';
import mapTransitions from './utils/mapTransitions';
import onTransition from './utils/onTransitionFactory';
import validate from './utils/validate';
import stateFor from './utils/stateFor';

export default function microstates(Type: ISchema, initial: any = undefined): IMicrostate {
  validate(Type, `microstates`);

  let tree = new TypeTree(Type);

  let state = stateFor(tree, initial);

  let transitions = mapTransitions(
    tree,
    [],
    onTransition(function onTransitionHandler(compute) {
      return stateFor(tree, compute(state));
    })
  );

  return {
    state,
    transitions,
  };
}
