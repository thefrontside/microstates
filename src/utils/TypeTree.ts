import getTypeDescriptors from './getTypeDescriptors';
import { IClass, IMicrostate, IMicrostateType, ITypeTree } from '../Interfaces';
import isPrimitive from './isPrimitive';
import getReducerType from './getReducerType';
import { reduceObject } from 'ioo';
import defineComputedProperty from './defineComputedProperty';
import MicrostateParameterizedArray from '../primitives/parameterizedArray';
import MicrostateArray from '../primitives/array';

export default class TypeTree implements ITypeTree {
  public isPrimitive;
  public isComposed;
  public isParameterized;
  public properties = null;
  public schemaType;
  public type;
  public of = null;
  public isList;
  public transitions = {};

  constructor(type) {
    if (Array.isArray(type) && type.length === 0) {
      type = Array;
    }
    this.isPrimitive = isPrimitive(type);
    this.isComposed = !this.isPrimitive;
    this.schemaType = type;
    this.type = getReducerType(type);
    this.isParameterized = this.type === MicrostateParameterizedArray;
    this.isList = this.type === MicrostateParameterizedArray || this.type === MicrostateArray;

    this.transitions = reduceObject(
      getTypeDescriptors(this.type),
      (accumulator, descriptor, name) => {
        return {
          ...accumulator,
          [name]: descriptor.value,
        };
      }
    );

    if (this.isComposed && this.isList) {
      this.of = [...type];
    }

    if (this.isComposed && !this.isList) {
      defineComputedProperty(
        this,
        'properties',
        () => {
          return reduceObject(getTypeDescriptors(new type()), (accumulator, descriptor, name) => {
            return {
              ...accumulator,
              [name]: new TypeTree(descriptor.value),
            };
          });
        },
        { enumerable: true }
      );
    }
  }
}
