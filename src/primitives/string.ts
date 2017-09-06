export default class MicrostateString extends String {
  static initialize = () => '';

  static concat = function concat(current: string, ...args: Array<string>) {
    return String.prototype.concat.apply(current, args);
  };
}
