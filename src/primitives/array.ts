export default class MicrostateArray extends Array {
  static initialize = (current: Array<any>, newState: any) => newState || [];

  static push = (current: Array<any>, ...args: Array<any>) => [...current, ...args];
}
