import { Foldable, foldl, foldr, Functor, map } from 'funcadelic';
import { reduceObject } from 'ioo';

import defineComputedProperty from './utils/define-computed-property';
import getReducerType from './utils/get-reducer-type';
import isList from './utils/is-list';
import isPrimitive from './utils/is-primitive';
import propertiesFor from './utils/properties-for';
import transitionsFor from './utils/transitions-for';

export default class TypeTree {
  constructor() {
    this.data = null;
  }
  static from(Type, path = []) {
    let primitive = isPrimitive(Type);
    let [name] = path.slice(-1);
    let list = isList(Type);
    return Object.create(TypeTree.prototype, {
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
                [propName]: TypeTree.from(type, [...path, propName]),
              });
            }
          );
        },
      },
    });
  }
}

Foldable.instance(TypeTree, {
  foldl(fn, initial = {}, tree) {
    return foldl((memo, args) => fn(memo, args), initial, tree.children);
  },
  foldr(fn, initial = {}, tree) {
    return foldr((memo, args) => fn(memo, args), initial, tree.children);
  },
});

Functor.instance(TypeTree, {
  /**
   * Lazily invoke callback on every proprerty of given tree,
   * the return value is assigned to property value.
   * 
   * @param {*} fn (TypeTree, path) => any
   * @param {*} tree Tree
   */
  map(fn, tree) {
    return foldl(
      (memo, { key, value }) =>
        defineComputedProperty(
          memo,
          key,
          function computePropertyValue() {
            return map(fn, value);
          },
          {
            enumerable: true,
          }
        ),
      fn(tree.data, tree.data.path),
      tree
    );
  },
});
