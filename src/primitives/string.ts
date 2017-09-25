export default class MicrostateString {
  initialize(current = '') {
    return current;
  }

  concat(current: string, ...args: Array<string>) {
    return String.prototype.concat.apply(current, args);
  }
}
