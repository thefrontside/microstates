export type IState = any | Array<any> | IStateObject;

export type IActions = Array<IAction> | IActionHash | IAction;

export interface IActionHash {
  [name: string]: IAction;
}

export type IClass = { new (): any };

export interface IActionsObject {
  [name: string]: IActions;
}

export interface IStateObject {
  [name: string]: IState;
}

export type IAction = (current: any, ...args: Array<any>) => any;
export interface IDescriptor {
  configurable: boolean;
  enumerable: boolean;
  value: any;
  writable: boolean;
  get: () => any;
  set: (value: any) => any;
}

export interface IDescriptorHash {
  [name: string]: IDescriptor;
}

export type IPath = Array<number | string>;
export interface IObserver {
  next: (ms: IMicrostate) => void;
}

export interface IUnsubscribe {
  unsubscribe: () => void;
}

export interface IMicrostate {
  state: IStateObject;
  actions: IActionsObject;
  subscribe?: (observer: IObserver) => IUnsubscribe;
}

export type IOnChange = (action: IAction, path: IPath, args: Array<any>) => IMicrostate | void;
