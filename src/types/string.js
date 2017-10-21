export default class StringType {
  constructor(value = '') {
    return new String(value);
  }
  concat(current, ...args) {
    return String.prototype.concat.apply(current, args);
  }
}
