import Primitive from './primitive';

export default class StringType extends Primitive {
  static name = "String";

  initialize(value) {
    if (value == null) {
      return '';
    } else {
      return String(value);
    }
  }

  concat(value) {
    return this.state.concat(value);
  }
}
