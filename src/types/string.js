export default class StringType {
  initialize(current = '') {
    return current;
  }
  concat(current, ...args) {
    return String.prototype.concat.apply(current, args);
  }
}
