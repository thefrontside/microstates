export default class BooleanType {
  static name = "Boolean";

  initialize(value) {
    return !!value;
  }
  toggle() {
    return !this.state;
  }
}
