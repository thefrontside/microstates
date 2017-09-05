import { IClass, IPolymorphic, ISchema } from '../Interfaces';

export default class Polymorphic {
  static match(o: any): IClass {
    throw new Error('You must implement static match method on a Polymorpic class');
  }

  static of(types: IClass | IClass[], match: (o: any) => IClass = undefined) {
    if (Array.isArray(types) && types.length === 1) {
      let [type] = types;
      match = () => type;
    }
    return class extends this {
      types = types;
      static match = match ? match : Polymorphic.match;
    };
  }
}
