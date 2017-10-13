export default class MicrostateArray {
  initialize(current = []) {
    return current;
  }
  push(current = [], ...args) {
    return [...current, ...args];
  }
  filter(current = [], callback) {
    return Array.prototype.filter.call(current, callback);
  }
  map(current = [], callback) {
    return Array.prototype.map.call(current, callback);
  }
}
