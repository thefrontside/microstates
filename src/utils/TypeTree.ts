import { reduceObject } from 'ioo';

import { IClass, IPath, ISchema, ITypeTree } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';
import getReducerType from './getReducerType';
import isList from './is-list';
import isParameterized from './is-parameterized';
import isPrimitive from './isPrimitive';
import propertiesFor from './properties-for';
import transitionsFor from './transitions-for';

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
    this.isList = isList(type);
    this.isParameterized = isParameterized(type);

    this.transitions = transitionsFor(type);

    if (this.isParameterized) {
      this.of = (type as Array<IClass>).map((type: IClass) => new TypeTree(type));
    }

    if (this.isComposed && !this.isList) {
      defineComputedProperty(
        this,
        'properties',
        () => {
          return reduceObject(propertiesFor(type), (accumulator, property, name: string) => {
            return {
              ...accumulator,
              [name]: new TypeTree(property, [...path, name]),
            };
          });
        },
        { enumerable: true }
      );
    }
  }
}
