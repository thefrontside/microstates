export type IState = any | Array<any> | IStateObject;

export type IActions = Array<IAction> | IActionMap | IAction;

export interface IActionMap {
  [name: string]: IAction;
}

export type IClass = { new (): any };

export type ISchema = IClass | Array<IClass>;

export type IStateType = ISchema | Array<ISchema>;

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

export interface IDescriptorMap {
  [name: string]: IDescriptor;
}

export type IPath = Array<PropertyKey>;
export interface IObserver {
  next: (ms: IMicrostate) => void;
}

export interface IUnsubscribe {
  unsubscribe: () => void;
}

export interface IMicrostate {
  state: IStateObject;
  actions: IActions;
  subscribe?: (observer: IObserver) => IUnsubscribe;
}

export type IOnChange = (action: IAction, path: IPath, args: Array<any>) => IMicrostate | void;

export interface IAttributeOverrides {
  configurable?: boolean;
  enumerable?: boolean;
  value?: any;
  writable?: boolean;
  get?: () => any;
  set?: (value: any) => any;
}
