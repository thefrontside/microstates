export interface IDescriptor {
  configurable: boolean;
  enumerable: boolean;
  value: any;
  writable: boolean;
  get: () => any;
  set: (value: any) => any;
}

export interface IObserver {
  next: (ms: IMicrostate) => void;
}

export interface IUnsubscribe {
  unsubscribe: () => void;
}

export interface IMicrostate {
  state: {};
  actions: {};
  subscribe: (observer: IObserver) => IUnsubscribe;
}
