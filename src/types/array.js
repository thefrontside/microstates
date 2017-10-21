export default class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
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
