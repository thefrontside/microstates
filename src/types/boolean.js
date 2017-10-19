export default class BooleanType {
  constructor(value = false) {
    return new Boolean(value);
  }
  toggle(current) {
    return !current;
  }
}
