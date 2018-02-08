export default class StringType {
  constructor(value = '') {
    return new String(value);
  }
  concat(...args) {
    return String.prototype.concat.apply(this.state, args);
  }
}
