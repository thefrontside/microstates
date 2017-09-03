import { IMicrostate, ISchema } from './Interfaces';
import TypeTree from './utils/TypeTree';
import mapState from './utils/mapState';
import mapTransitions from './utils/mapTransitions';
import getValue from './utils/getValueFactory';
import onTransition from './utils/onTransitionFactory';
import validate from './utils/validate';

export default function microstates(Type: ISchema, initial: any = undefined): IMicrostate {
  validate(Type, `microstates`);

  let tree = new TypeTree(Type);

  let state = mapState(tree, [], getValue(initial));

  let transitions = mapTransitions(
    tree,
    [],
    onTransition(function onTransitionHandler(compute) {
      return mapState(tree, [], getValue(compute(state)));
    })
  );

  return {
    state,
    transitions,
  };
}
