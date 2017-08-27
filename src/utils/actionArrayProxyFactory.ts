import { IClass, IOnChange, IPath } from '../Interfaces';
import createActions from './createActions';
import traverseActions from './traverseActions';
import isNumeric from './isNumeric';
import MicrostateArray from '../primitives/array';

export default function actionArrayProxyFactory(
  type: Array<IClass>,
  path: IPath,
  onChange: IOnChange
) {
  let [composedType] = type;
  let actions = createActions(MicrostateArray, path, onChange);
  return new Proxy([], {
    get(target, property: string) {
      if (actions[property]) {
        return actions[property];
      } else if (isNumeric(property)) {
        return traverseActions(composedType, [...path, parseInt(property)], onChange);
      } else {
        return target[property];
      }
    },
  });
}
