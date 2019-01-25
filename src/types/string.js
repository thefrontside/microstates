import Primitive from './primitive';

export default class StringType extends Primitive {
  static name = "String";

  initialize(value) {
    if (value instanceof String) {
      return value;
    } else {
      return new String(value);
    }
  }

  concat(value) {
    return this.state.concat(value);
  }
}
