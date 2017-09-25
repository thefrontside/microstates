export default class MicrostateString {
  initialize() {
    return '';
  }

  concat(current: string, ...args: Array<string>) {
    return String.prototype.concat.apply(current, args);
  }
}
