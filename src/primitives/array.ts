export default class MicrostateArray extends Array {
  static initialize = (): any[] => [];

  static push = (current: Array<any>, ...args: Array<any>) => [...current, ...args];
}
