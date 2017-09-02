import MicrostateBoolean from './primitives/boolean';
import MicrostateArray from './primitives/array';
import { isPrimitive } from 'util';
import MicrostateString from './primitives/string';
import MicrostateNumber from './primitives/number';
import MicrostateObject from './primitives/object';
import MicrostateParameterizedArray from './primitives/parameterizedArray';

export type IState = any | Array<any> | IStateObject;

export type IActions = Array<IAction> | IActionMap | IAction;

export interface IActionMap {
  [name: string]: IAction;
}

export type IClass = { new (): any; name: String };

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

export type IPath = Array<string | number>;
export interface IObserver {
  next: (ms: IMicrostate) => void;
}

export interface IUnsubscribe {
  unsubscribe: () => void;
}

export interface IMicrostate {
  state: IStateObject;
  transitions: IActions;
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

export interface ITransitionMap {
  [name: string]: (current: any, ...args: Array<any>) => any;
}

export type IMicrostateType =
  | MicrostateString
  | MicrostateNumber
  | MicrostateObject
  | MicrostateArray
  | MicrostateBoolean
  | MicrostateParameterizedArray;

export interface ITypeTree {
  name: string;
  path: IPath;
  isPrimitive: boolean;
  isComposed: boolean;
  isParameterized: boolean;
  isList: boolean;
  properties: ITypeTreeProperties | null;
  transitions: ITransitionMap;
  schemaType: ISchema;
  type: IMicrostateType;
  of: Array<ITypeTree>;
}

export interface ITypeTreeProperties {
  [name: string]: ITypeTree;
}
