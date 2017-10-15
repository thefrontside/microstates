export default class StringState {
  initialize(current = '') {
    return current;
  }
  concat(current, ...args) {
    return String.prototype.concat.apply(current, args);
  }
}
