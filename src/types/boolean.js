export default class BooleanType {
  initialize(current = false) {
    return current;
  }
  toggle(current) {
    return !current;
  }
}
