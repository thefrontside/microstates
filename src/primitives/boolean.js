export default class MicrostateBoolean {
  initialize(current = false) {
    return current;
  }
  toggle(current = false) {
    return !current;
  }
}
