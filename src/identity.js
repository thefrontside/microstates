import { valueOf } from './meta';

import Storage from './storage';
import Pathmap from './pathmap';

export default function Identity(microstate, observe = x => x) {
  let { Type } = microstate.constructor;
  let pathmap = Pathmap(Type, new Storage(valueOf(microstate), () => observe(pathmap.get())));
  return pathmap.get();
}
