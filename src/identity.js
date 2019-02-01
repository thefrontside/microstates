import { valueOf } from './meta';

import Storage from './storage';
import Pathmap, { idOf } from './pathmap';

export default function Identity(microstate, observe = x => x) {
  let { Type } = microstate.constructor;
  let pathmap = Pathmap(Type, new Storage(valueOf(microstate), () => observe(idOf(pathmap))));
  return idOf(pathmap);
}
