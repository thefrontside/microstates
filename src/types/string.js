import Primitive from './primitive';

export default class StringType extends Primitive {
  static name = "String";

  initialize(value) {
    return String(value == null ? '' : value);
  }

  concat(value) {
    return this.state.concat(value);
  }
}
