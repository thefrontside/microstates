import { CurriedFunction3 } from 'ramda/src/$curriedFunctions';

import { ITransition } from '../Interfaces';
import * as view from 'ramda/src/view';
import * as set from 'ramda/src/set';
import { ManualLens } from 'ramda/src/$types';
import * as curry from 'ramda/src/curry';

export default curry(function transition(
  fn: ITransition,
  lens: ManualLens<{}, any>,
  value: any,
  ...args: any[]
): CurriedFunction3<ITransition, ManualLens<{}, any>, any, any[]> {
  let current = view(lens, value);
  return set(lens, fn(current, ...args), value);
});
