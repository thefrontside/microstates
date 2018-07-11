export default class BooleanType {
  initialize(value) {
    return Boolean(value);
  }

  toggle() {
    return !this.state;
  }
}
