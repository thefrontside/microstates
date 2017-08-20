export default class MicrostateString extends String {
  static concat = (current: string, ...args: Array<string>) =>
    String.prototype.concat.apply(current, args);
}
