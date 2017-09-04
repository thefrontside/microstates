import * as __ from 'ramda/src/__';
import * as lensPath from 'ramda/src/lensPath';
import * as set from 'ramda/src/set';
import * as view from 'ramda/src/view';
import * as curry from 'ramda/src/curry';
import { CurriedFunction2 } from 'ramda/src/$curriedFunctions';

import { IPath, ITransition } from '../Interfaces';

export default function getValueFactory(
  state: any
): CurriedFunction2<ITransition, (string | number)[], any> {
  return curry(function getValue(initialize: ITransition, path: IPath, state: any) {
    let lens = lensPath(path);
    let value = view(lens, state);

    if (initialize) {
      return value || initialize(value);
    } else {
      return value;
    }
  })(__, __, state);
}
