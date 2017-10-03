export default class MicrostateObject {
  initialize(current = {}) {
    return current;
  }
  assign(current, props) {
    return Object.assign({}, current, props);
  }
}
