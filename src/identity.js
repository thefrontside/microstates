import { valueOf } from './meta';

class Ref {
  constructor(value, observe) {
    this.value = value;
    this.observe = observe;
  }

  get() {
    return this.value;
  }

  set(value) {
    if (value !== this.value) {
      this.value = value;
      this.observe();
    }
  }
}

import Pathmap, { idOf } from './pathmap';

export default function Identity(microstate, observe = x => x) {
  let { Type } = microstate.constructor;
  let pathmap = Pathmap(Type, new Ref(valueOf(microstate), () => observe(idOf(pathmap))));
  return idOf(pathmap);
}
