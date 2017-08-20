export interface IDescriptor {
  configurable: boolean;
  enumerable: boolean;
  value: any;
  writable: boolean;
  get: () => any;
  set: (value: any) => any;
}
