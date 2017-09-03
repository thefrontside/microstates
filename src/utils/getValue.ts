import { lensPath, set, view, curry } from 'ramda';
import { IPath, ITransition } from '../Interfaces';

export default curry(function getValue(initialize: ITransition, path: IPath, state: any) {
  let lens = lensPath(path);
  let value = view(lens, state);

  if (initialize) {
    return value || initialize(value);
  } else {
    return value;
  }
});
