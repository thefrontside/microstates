export type IState = Array<any> | {};

export type IClass = { new (): any };

export interface IActionsObject {
  [name: string]: (current: any, ...args: Array<any>) => any;
}
export interface IDescriptor {
  configurable: boolean;
  enumerable: boolean;
  value: any;
  writable: boolean;
  get: () => any;
  set: (value: any) => any;
}

export type IPath = Array<number | string>;
export interface IObserver {
  next: (ms: IMicrostate) => void;
}

export interface IUnsubscribe {
  unsubscribe: () => void;
}

export interface IMicrostate {
  state: {};
  actions: {};
  subscribe?: (observer: IObserver) => IUnsubscribe;
}

export type IOnChange = (newState: IState) => IState | void;
