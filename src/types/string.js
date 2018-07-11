export default class StringType {
  initialize(value) {
    return String(value == null ? '' : value);
  }
}
