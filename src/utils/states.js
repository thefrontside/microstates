import { append, map } from 'funcadelic';

import initialize from './initialize';
import isPrimitive from './is-primitive';
import gettersFor from './getters-for';

export default function States(tree, value) {
  return map(
    ({ Type, value }) => (isPrimitive(Type) ? value : append(gettersFor(Type), value)),
    map(data => append(data, { value: initialize(data, value) }), tree)
  ).collapsed;
}
