import { IMicrostate, ISchema } from './Interfaces';
import TypeTree from './utils/TypeTree';
import mapState from './utils/mapState';
import mapTransitions from './utils/mapTransitions';
import getValue from './utils/getValueFactory';
import onTransition from './utils/onTransitionFactory';

export default function microstates(Class: ISchema, initial: any = undefined): IMicrostate {
  if (!(typeof Class === 'function' || Array.isArray(Class))) {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let tree = new TypeTree(Class);

  let state = mapState(tree, [], getValue(initial));

  let transitions = mapTransitions(
    tree,
    [],
    onTransition(function onTransitionHandler(newState: any) {
      return mapState(tree, [], getValue(newState));
    }, state)
  );

  return {
    state,
    transitions,
  };
}
