import { reduceObject } from 'ioo';

import { IPath, ISchema, ITypeTree } from '../Interfaces';
import defineComputedProperty from './defineComputedProperty';
import getReducerType from './getReducerType';
import isList from './is-list';
import isParameterized from './is-parameterized';
import isPrimitive from './isPrimitive';
import propertiesFor from './properties-for';
import transitionsFor from './transitions-for';

export default class Tree {
  data: ITypeTree = null;
  children: { [name: string]: Tree };

  static from(Type: ISchema, path: IPath = []): Tree {
    let primitive = isPrimitive(Type);
    let [name] = path.slice(-1);
    let parameterized = isParameterized(Type);
    let list = isList(Type);

    return Object.create(Tree.prototype, {
      data: {
        get() {
          return {
            name,
            path,
            type: getReducerType(Type),
            schemaType: Type,
            isPrimitive: primitive,
            isComposed: !primitive,
            isList: list,
            isParameterized: parameterized,
            transitions: transitionsFor(Type),
            /**
             * of evaluates to an array of Tree nodes. This is used for parameterized list
             * to instantiated composed states.
             */
            get of() {
              return list && parameterized ? [Tree.from(Type[0])] : null;
            },
          };
        },
      },
      /**
       * children property is a map of composed types. When read, it will
       * evaluate to a map of instances of Tree nodes. For example,
       * 
       * class Person {
       *  name = String;
       *  age = Number;
       * }
       * 
       * `Tree.from(Person).children` will evaluate to { name: Tree, age: Tree }
       * 
       * children property is a getter to prevent eager evaluation of children because
       * eager evaluation will cause Inifinte loop in self referencing recursive schemas.
       * 
       * For example,
       * 
       * class Person {
       *  parent = Person;
       * }
       * 
       * Eager evaluation would cause infinite loop because parent would be evaluated recursively.
       */
      children: {
        get() {
          return reduceObject(
            propertiesFor(getReducerType(Type)),
            (accumulator, type: ISchema, propName: string) => {
              return {
                ...accumulator,
                [propName]: Tree.from(type, [...path, propName]),
              };
            }
          );
        },
      },
    });
  }

  static map(fn: (node: ITypeTree, path: IPath) => any, tree: Tree): any {
    return reduceObject(
      tree.children,
      (accumulator, child: Tree, name: string) => {
        return defineComputedProperty(
          accumulator,
          name,
          function compute() {
            return Tree.map(fn, child);
          },
          {
            enumerable: true,
          }
        );
      },
      fn(tree.data, tree.data.path)
    );
  }
}
