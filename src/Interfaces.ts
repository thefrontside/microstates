import MicrostateBoolean from './primitives/boolean';
import MicrostateArray from './primitives/array';
import MicrostateString from './primitives/string';
import MicrostateNumber from './primitives/number';
import MicrostateObject from './primitives/object';

export type IState = any | Array<any> | IStateObject;

export type ITransitions = ITransitionMap | ITransition;

export type IPath = Array<string | number>;

export interface IMicrostate {
  state: IStateObject;
  transitions: ITransitions;
}

export interface ITransitionMap {
  [name: string]: (current: any, ...args: Array<any>) => any;
}

export type IClass = { new (): any; name: String };

export type ISchema = IClass | Array<IClass>;

export interface IStateObject {
  [name: string]: IState;
}

export type ITransition = (current: any, ...args: Array<any>) => any;

export interface IDescriptor {
  configurable: boolean;
  enumerable: boolean;
  value: any;
  writable: boolean;
  get?: () => any;
  set?: (value: any) => any;
}

export type IMicrostateType =
  | MicrostateString
  | MicrostateNumber
  | MicrostateObject
  | MicrostateArray
  | MicrostateBoolean;

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
