import MicrostateObject from '../primitives/object';
import getTypeDescriptors from './getTypeDescriptors';
import {
  IClass,
  ISchema,
  ITypeTree,
  IPath,
} from '../Interfaces';
import isPrimitive from './isPrimitive';
import getReducerType from './getReducerType';
import { reduceObject } from 'ioo';
import defineComputedProperty from './defineComputedProperty';
import MicrostateArray from '../primitives/array';
import { mergeDeepRight } from 'ramda';

export default class TypeTree implements ITypeTree {
  public name: ITypeTree['name'];
  public path: ITypeTree['path'];
  public isPrimitive: ITypeTree['isPrimitive'];
  public isComposed: ITypeTree['isComposed'];
  public isParameterized: ITypeTree['isParameterized'];
  public properties: ITypeTree['properties'] = null;
  public schemaType: ITypeTree['schemaType'];
  public type: ITypeTree['type'];
  public of: ITypeTree['of'] = null;
  public isList: ITypeTree['isList'];
  public transitions: ITypeTree['transitions'] = {};

  constructor(type: ISchema, path: IPath = []) {
    let [name] = path.slice(-1);
    this.name = name as string;
    this.path = path;
    this.isPrimitive = isPrimitive(type);
    this.isComposed = !this.isPrimitive;
    this.schemaType = type;
    this.type = getReducerType(type);
    this.isList = this.type === MicrostateArray;
    this.isParameterized = this.isList && Array.isArray(type) && type.length > 0;

    this.transitions = reduceObject(
      getTypeDescriptors(this.type),
      (accumulator, descriptor, name) => {
        return {
          ...accumulator,
          [name]: descriptor.value,
        };
      }
    );

    this.transitions = {
      ...this.transitions,
      set: function set(current: any, state: any) {
        return state && state.valueOf ? state.valueOf() : state;
      },
    };

    if (this.isComposed || getReducerType(type) === MicrostateObject) {
      this.transitions = {
        ...this.transitions,
        merge: function merge(current, state) {
          return mergeDeepRight(current, state && state.valueOf ? state.valueOf() : state);
        },
      };
    }

    if (this.isParameterized) {
      this.of = (type as Array<IClass>).map((type: IClass) => new TypeTree(type));
    }

    if (this.isComposed && !this.isList) {
      if (!this.transitions.initialize) {
        this.transitions = {
          ...this.transitions,
          initialize: function initialize(current, ...args) {
            return new (type as IClass)(...args);
          },
        };
      }

      defineComputedProperty(
        this,
        'properties',
        () => {
          return reduceObject(
            getTypeDescriptors(new (type as IClass)()),
            (accumulator, descriptor, name: string) => {
              return {
                ...accumulator,
                [name]: new TypeTree(descriptor.value, [...path, name]),
              };
            }
          );
        },
        { enumerable: true }
      );
    }
  }
}
