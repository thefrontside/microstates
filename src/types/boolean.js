import Primtive from './primitive';

export default class BooleanType extends Primtive {
  static name = "Boolean";

  initialize(value) {
    if (value instanceof Boolean) {
      return value;
    } else {
      return new Boolean(Boolean(value.valueOf()));
    }
  }

  toggle() {
    return !this.state;
  }
}
