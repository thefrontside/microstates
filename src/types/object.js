export default class ObjectType {
  initialize(current = {}) {
    return current;
  }
  assign(current, props) {
    return Object.assign({}, current, props);
  }
}
