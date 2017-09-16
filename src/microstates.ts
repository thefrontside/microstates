import { IMicrostate, ISchema } from './Interfaces';
import TypeTree from './utils/TypeTree';
import mapState from './utils/mapState';
import mapTransitions from './utils/mapTransitions';
import onTransition from './utils/onTransitionFactory';
import validate from './utils/validate';
import * as view from 'ramda/src/view';
import * as __ from 'ramda/src/__';

export default function microstates(Type: ISchema, initial: any = undefined): IMicrostate {
  validate(Type, `microstates`);

  let tree = new TypeTree(Type);

  let state = mapState(tree, [], view(__, initial));

  let transitions = mapTransitions(
    tree,
    [],
    onTransition(function onTransitionHandler(compute) {
      return mapState(tree, [], view(__, compute(state)));
    })
  );

  return {
    state,
    transitions,
  };
}
