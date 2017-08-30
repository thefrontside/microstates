import isPrimitive from './isPrimitive';
import actionArrayProxyFactory from './actionArrayProxyFactory';
import { ISchema, IOnChange, IPath, IActions } from '../Interfaces';
import createActions from './createActions';
import traverseActions from './traverseActions';

export default function matchActionType(type: ISchema, path: IPath, onChange: IOnChange): IActions {
  if (Array.isArray(type)) {
    return actionArrayProxyFactory(type, path, onChange);
  }

  if (isPrimitive(type)) {
    return createActions(type, path, onChange);
  }

  return traverseActions(type, path, onChange);
}
