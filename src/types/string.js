export default class StringType {
  constructor(value = '') {
    return new String(value);
  }
  concat(...args) {
    return this.set(String.prototype.concat.apply(this.state, args));
  }
}
