export default class BooleanType {
  initialize(value) {
    return !!value;
  }
  toggle() {
    return !this.state;
  }
}
