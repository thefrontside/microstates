import { Functor } from 'funcadelic';
import { reduceObject } from 'ioo';

import defineComputedProperty from './define-computed-property';
import getReducerType from './get-reducer-type';
import isList from './is-list';
import isPrimitive from './is-primitive';
import propertiesFor from './properties-for';
import transitionsFor from './transitions-for';

class Tree {
  constructor() {
    this.data = null;
  }
  static from(Type, path = []) {
    let primitive = isPrimitive(Type);
    let [name] = path.slice(-1);
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
            transitions: transitionsFor(Type),
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
            (accumulator, type, propName) => {
              return Object.assign({}, accumulator, {
                [propName]: Tree.from(type, [...path, propName]),
              });
            }
          );
        },
      },
    });
  }
  static map(fn, tree) {
    return reduceObject(
      tree.children,
      (accumulator, child, name) => {
        return defineComputedProperty(
          accumulator,
          name,
          function computeNode() {
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

Functor.instance(Tree, {
  map() {},
});

export default Tree;
