import * as __ from 'ramda/src/__';
import * as lensPath from 'ramda/src/lensPath';
import * as set from 'ramda/src/set';
import * as view from 'ramda/src/view';
import * as curry from 'ramda/src/curry';

import { IPath, ITransition, CurriedGetValue } from '../Interfaces';

export default function getValueFactory(state: any): CurriedGetValue {
  return curry(function getValue(path: IPath, state: any) {
    let lens = lensPath(path);
    return view(lens, state);
  })(__, state);
}
