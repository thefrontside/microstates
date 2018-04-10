export default class BooleanType {
  constructor(value = false) {
    return new Boolean(value);
  }
  toggle() {
    return this.set(!this.state);
  }
}
