export default class BooleanState {
  initialize(current = false) {
    return current;
  }
  toggle(current = false) {
    return !current;
  }
}
