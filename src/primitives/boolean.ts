export default class MicrostateBoolean {
  initialize() {
    return false;
  }

  toggle(current: boolean) {
    return !current;
  }
}
