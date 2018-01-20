import $ from './chain';
import { append, filter, reduce, map } from 'funcadelic';
import toTypeClass from './to-type-class';

let { keys } = Object;

export default class Tree {
  constructor(props = { data: () => ({}), children: () => ({}) }) {
    return Object.create(Tree.prototype, {
      data: {
        get: props.data,
      },
      children: {
        get: props.children,
      },
    });
  }

  get collapsed() {
    if (keys(this.children).length > 0) {
      return append(this.data, map(child => child.collapsed, this.children));
    } else {
      return this.data;
    }
  }

  static from(TypeOfValue, path = []) {
    let Type = toTypeClass(TypeOfValue);

    return new Tree({
      data() {
        return { path, Type };
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
        return $(new Type())
          .filter(({ value }) => !!value && value.call)
          .map((ChildType, key) => Tree.from(ChildType, append(path, key)))
          .valueOf();
      },
    });
  }
}
