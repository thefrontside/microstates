export default class ObjectType {
  constructor(value = {}) {
    return new Object(value);
  }
  assign(current, props) {
    return Object.assign({}, current, props);
  }
}
