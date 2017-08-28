import { IAction, IOnChange, IPath } from '../Interfaces';
import markMicrostateAction from './markMicrostateAction';

export default function actionFactory(action: IAction, path: IPath, onChange: IOnChange) {
  return markMicrostateAction((...args: Array<any>) => {
    return onChange(action, path, args);
  });
}
