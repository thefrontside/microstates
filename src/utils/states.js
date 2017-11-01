import { append, map } from 'funcadelic';

import initialize from './initialize';
import isPrimitive from './is-primitive';
import gettersFor from './getters-for';
import constantsFor from './constants-for';

export default function States(tree, value) {
  return map(
    ({ Type, value }) =>
      isPrimitive(Type) ? value : append(value, append(gettersFor(Type), constantsFor(Type))),
    map(data => append(data, { value: initialize(data, value) }), tree)
  );
}
