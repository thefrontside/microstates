export default class MicrostateArray {
  initialize(): any[] {
    return [];
  }

  push(current: Array<any>, ...args: Array<any>) {
    return [...current, ...args];
  }

  filter(current: Array<any>, callback: (value: any, index: number, array: any[]) => boolean) {
    return Array.prototype.filter.call(current, callback);
  }

  map(current: Array<any>, callback: (value: any, index: number, array: any[]) => any[]) {
    return Array.prototype.map.call(current, callback);
  }
}
