import { isMicrostateAction } from '../constants';
import { IAction } from '../Interfaces';

export default function markMicrostateAction(fn: IAction) {
  fn['isMicrostateAction'] = isMicrostateAction;
  return fn;
}
