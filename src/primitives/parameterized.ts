import { IClass, IMicrostateType, ISchema, IParameterized } from '../Interfaces';

export default class Parameterized implements IParameterized {
  static type: IClass;
  static types: IMicrostateType[] = [];

  static match(o: any): IClass | void {
    let constructor = o !== null && o.constructor;
    if (constructor && this.types.indexOf(constructor) !== -1) {
      return constructor;
    }
  }

  static of(...args: IClass[]) {
    const ParameterizedClass: IClass = class extends this {
      static types = args;
    };

    return ParameterizedClass;
  }
}
