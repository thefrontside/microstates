import { Assemble } from './assemble';
import Any from './types/any';
import parameterized from './parameterized';

export class Sugar {
  constructor() {
    this.desugarType = value => typeof value === 'function' ? value : Constant.of(value)
  }

  mapType(Type, Delegate) {
    return this.extendTypes(Constructor => Constructor === Type ? Delegate : Constructor);
  }

  extendTypes(transform) {
    let next = this.desugarType;
    this.desugarType = Type => next(transform(Type));
  }
}


const Constant = parameterized(value => class Constant {
  static initialize() {
    Assemble.instance(this, {
      assemble(Type, instance) {
        instance.state = value;
        return instance;
      }
    })
  }
})


export default new Sugar();
