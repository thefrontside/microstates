import Primtive from './primitive';

export default class BooleanType extends Primtive {
  static name = "Boolean";

  initialize(value) {
    return !!value;
  }
  toggle() {
    return !this.state;
  }
}
