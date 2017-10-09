import { append, filter, map } from 'funcadelic';

import getReducerType from './get-reducer-type';
import initializerFor from './initializer-for';
import isPrimitive from './is-primitive';
import transitionsFor from './transitions-for';
import Tree from './tree';

export default function treeFromType(Type, path = []) {
  return Tree.create({
    data() {
      return {
        path,
        Type,
        type: getReducerType(Type),
        isPrimitive: isPrimitive(Type),
        transitions: transitionsFor(Type),
        initialize: initializerFor(Type),
      };
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
    children() {
      let Reducer = getReducerType(Type);
      let childTypes = filter(({ value }) => !!value.call, new Reducer());

      return map((ChildType, key) => treeFromType(ChildType, append(path, key)), childTypes);
    },
  });
}
