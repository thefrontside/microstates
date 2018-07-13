export default class StringType {
  initialize(value) {
    return String(value == null ? '' : value);
  }

  concat(value) {
    return this.state.concat(value);
  }
}
