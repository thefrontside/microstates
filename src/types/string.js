export default class StringType {
  initialize(value = '') {
    return new String(value).valueOf();
  }
  concat(...args) {
    return this.set(String.prototype.concat.apply(this.state, args));
  }
}
