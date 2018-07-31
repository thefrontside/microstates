export default class StringType {
  static name = "String";

  initialize(value) {
    return String(value == null ? '' : value);
  }

  concat(value) {
    return this.state.concat(value);
  }
}
