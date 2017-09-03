import { lensPath, set, view, curry, __ } from 'ramda';
import { IPath, ITransition } from '../Interfaces';

export default function getValueFactory(state: any) {
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
