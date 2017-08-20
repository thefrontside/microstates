export default class MicrostateArray extends Array {
  static push = (current: Array<any>, ...args: Array<any>) => [...current, ...args];
}
