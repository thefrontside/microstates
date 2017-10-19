export default class ArrayType {
  initialize(current = []) {
    return current;
  }
  push(current, ...args) {
    return [...current, ...args];
  }
  filter(current, callback) {
    return Array.prototype.filter.call(current, callback);
  }
  map(current, callback) {
    return Array.prototype.map.call(current, callback);
  }
}
