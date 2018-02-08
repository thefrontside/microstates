export default class ObjectType {
  constructor(value = {}) {
    return new Object(value);
  }
  assign(props) {
    return Object.assign({}, this.state, props);
  }
}
