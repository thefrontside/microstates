export default class ObjectState {
  initialize(current = {}) {
    return current;
  }
  assign(current, props) {
    return Object.assign({}, current, props);
  }
}
