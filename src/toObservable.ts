import { Observable } from 'rxjs/Rx';
import { ISchema } from './Interfaces';
import validate from './utils/validate';
import ObservableMicrostate from './utils/ObservableMicrostate';

export default function toObservable(
  Type: ISchema,
  initial: any = undefined
): ObservableMicrostate {
  validate(Type, 'toObservable');

  return new ObservableMicrostate(Type, initial);
}
