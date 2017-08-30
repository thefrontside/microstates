import actionFactory from './actionFactory';
import getReducerType from './getReducerType';
import getTypeDescriptors from './getTypeDescriptors';
import markMicrostateAction from './markMicrostateAction';
import reduceActionDescriptors from './reduceActionDescriptors';
import { IAction, ISchema, IOnChange, IPath } from '../Interfaces';
import setAction from './setAction';

import traverseActions from './traverseActions';
import defineComputedProperty from './defineComputedProperty';

export default function createActions(type: ISchema, path: IPath, onChange: IOnChange) {
  let actions = reduceActionDescriptors(
    getTypeDescriptors(getReducerType(type)),
    action => actionFactory(action, path, onChange),
    {
      enumerable: true,
    }
  );
  return defineComputedProperty(actions, 'set', () => setAction(type, path, onChange), {
    enumerable: true,
  });
}
