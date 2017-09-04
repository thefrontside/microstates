export default class MicrostateString extends String {
  static initialize = function initialize(current: string, newState: any) {
    return newState || '';
  };

  static concat = function concat(current: string, ...args: Array<string>) {
    return String.prototype.concat.apply(current, args);
  };
}
