export default class MicrostateArray extends Array {
  static initialize = (): any[] => [];

  static push = (current: Array<any>, ...args: Array<any>) => [...current, ...args];

  static filter = (
    current: Array<any>,
    callback: (value: any, index: number, array: any[]) => boolean
  ) => Array.prototype.filter.call(current, callback);

  static map = (
    current: Array<any>,
    callback: (value: any, index: number, array: any[]) => any[]
  ) => Array.prototype.map.call(current, callback);
}
