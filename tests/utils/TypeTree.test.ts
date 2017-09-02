import 'jest';

import TypeTree from '../../src/utils/TypeTree';
import MicrostateString from '../../src/primitives/string';
import MicrostatesNumber from '../../src/primitives/number';
import MicrostateBoolean from '../../src/primitives/boolean';
import MicrostateObject from '../../src/primitives/object';
import MicrostateArray from '../../src/primitives/array';
import MicrostateParameterizedArray from '../../src/primitives/parameterizedArray';

let has = (subject, property, value) =>
  it(`has ${property} as ${value}`, () => expect(subject[property]).toEqual(value));

describe('TypeTree', () => {
  describe('primitives', () => {
    describe('number', () => {
      let number = new TypeTree(Number);
      has(number, 'path', []);
      has(number, 'isPrimitive', true);
      has(number, 'isComposed', false);
      has(number, 'isParameterized', false);
      has(number, 'isList', false);
      has(number, 'properties', null);
      has(number, 'schemaType', Number);
      has(number, 'type', MicrostatesNumber);
      has(number, 'of', null);
      it('has transitions', () => {
        expect(number.transitions.set).toBeDefined();
        expect(number.transitions.increment).toBeDefined();
      });
    });
    describe('string', () => {
      let string = new TypeTree(String);
      has(string, 'path', []);
      has(string, 'isPrimitive', true);
      has(string, 'isComposed', false);
      has(string, 'isParameterized', false);
      has(string, 'isList', false);
      has(string, 'properties', null);
      has(string, 'schemaType', String);
      has(string, 'type', MicrostateString);
      has(string, 'of', null);
      it('has transitions', () => {
        expect(string.transitions.set).toBeDefined();
        expect(string.transitions.concat).toBeDefined();
      });
    });
    describe('boolean', () => {
      let boolean = new TypeTree(Boolean);
      has(boolean, 'path', []);
      has(boolean, 'isPrimitive', true);
      has(boolean, 'isComposed', false);
      has(boolean, 'isParameterized', false);
      has(boolean, 'isList', false);
      has(boolean, 'properties', null);
      has(boolean, 'schemaType', Boolean);
      has(boolean, 'type', MicrostateBoolean);
      has(boolean, 'of', null);
      it('has transitions', () => {
        expect(boolean.transitions.set).toBeDefined();
        expect(boolean.transitions.toggle).toBeDefined();
      });
    });
    describe('object', () => {
      let object = new TypeTree(Object);
      has(object, 'path', []);
      has(object, 'isPrimitive', true);
      has(object, 'isComposed', false);
      has(object, 'isParameterized', false);
      has(object, 'isList', false);
      has(object, 'properties', null);
      has(object, 'schemaType', Object);
      has(object, 'type', MicrostateObject);
      has(object, 'of', null);
      it('has transitions', () => {
        expect(object.transitions.set).toBeDefined();
        expect(object.transitions.assign).toBeDefined();
        expect(object.transitions.merge).toBeDefined();
      });
    });
    describe('array', () => {
      function array_it(type) {
        let array = new TypeTree(type);
        has(array, 'path', []);
        has(array, 'isPrimitive', true);
        has(array, 'isComposed', false);
        has(array, 'isParameterized', false);
        has(array, 'isList', true);
        has(array, 'properties', null);
        has(array, 'schemaType', Array);
        has(array, 'type', MicrostateArray);
        has(array, 'of', null);
        it('has transitions', () => {
          expect(array.transitions.set).toBeDefined();
          expect(array.transitions.push).toBeDefined();
        });
      }
      describe('Array', () => {
        array_it(Array);
      });
      describe('[]', () => {
        array_it([]);
      });
    });
  });
  describe('composed', () => {
    describe('objects', () => {
      describe('transitions', () => {
        let tree;
        beforeEach(() => {
          tree = new TypeTree(class {});
        });
        it('has set', () => {
          expect(tree.transitions.set).toBeDefined();
        });
        it('has merge', () => {
          expect(tree.transitions.merge).toBeDefined();
        });
        describe('initialize', () => {
          class WithInitialize {
            static initialize = () => {};
          }
          it('initialize transition is used when present', () => {
            expect(new TypeTree(WithInitialize)).toHaveProperty(
              'transitions.initialize',
              WithInitialize.initialize
            );
          });
          describe('default', () => {
            let args, tree, p;
            class Plain {
              constructor(..._args) {
                args = _args;
              }
            }
            beforeEach(() => {
              tree = new TypeTree(Plain);
              p = tree.transitions.initialize(null, 'a', 'b', 'c');
            });
            it('receives default when not specified', () => {
              expect(tree).toHaveProperty('transitions.initialize');
            });
            it('returns new instance of type', () => {
              expect(p).toBeInstanceOf(Plain);
            });
            it('passes args to constructor', () => {
              expect(args).toEqual(['a', 'b', 'c']);
            });
          });
        });
      });
      describe('without properties', () => {
        class Item {}
        let tree = new TypeTree(Item);
        has(tree, 'path', []);
        has(tree, 'isPrimitive', false);
        has(tree, 'isComposed', true);
        has(tree, 'isParameterized', false);
        has(tree, 'isList', false);
        has(tree, 'schemaType', Item);
        has(tree, 'type', Item);
        has(tree, 'properties', {});
        has(tree, 'of', null);
      });
      describe('with properties', () => {
        class Item {
          string = String;
          number = Number;
          boolean = Boolean;
          object = Object;
          array = Array;
        }
        let tree = new TypeTree(Item);
        it('have paths', () => {
          expect(tree).toHaveProperty('properties.string.path', ['string']);
          expect(tree).toHaveProperty('properties.number.path', ['number']);
          expect(tree).toHaveProperty('properties.boolean.path', ['boolean']);
          expect(tree).toHaveProperty('properties.object.path', ['object']);
          expect(tree).toHaveProperty('properties.array.path', ['array']);
        });
        it('have fields', () => {
          expect(tree).toHaveProperty('properties.string.isPrimitive', true);
          expect(tree).toHaveProperty('properties.number.isPrimitive', true);
          expect(tree).toHaveProperty('properties.boolean.isPrimitive', true);
          expect(tree).toHaveProperty('properties.object.isPrimitive', true);
          expect(tree).toHaveProperty('properties.array.isPrimitive', true);
        });
        it('fields have names', () => {
          expect(tree).toHaveProperty('properties.string.name', 'string');
          expect(tree).toHaveProperty('properties.number.name', 'number');
          expect(tree).toHaveProperty('properties.boolean.name', 'boolean');
          expect(tree).toHaveProperty('properties.object.name', 'object');
          expect(tree).toHaveProperty('properties.array.name', 'array');
        });
      });
      describe('composed properties', () => {
        class Child {
          name = String;
        }
        class Parent {
          name = String;
          child = Child;
        }
        let tree = new TypeTree(Parent);
        it('are present', () => {
          expect(Object.keys(tree.properties).length).toBe(2);
          expect(tree.properties.child).toHaveProperty('path', ['child']);
          expect(tree.properties.child).toHaveProperty('isPrimitive', false);
          expect(tree.properties.child).toHaveProperty('isComposed', true);
          expect(tree.properties.child).toHaveProperty('isParameterized', false);
          expect(tree.properties.child).toHaveProperty('schemaType', Child);
          expect(tree.properties.child).toHaveProperty('type', Child);
          expect(tree.properties.child.properties.name).toHaveProperty('isPrimitive', true);
        });
      });
      it('supports circular composed objects', () => {
        class Item {
          item = Item;
        }
        let tree = new TypeTree(Item);
        expect(tree.properties.item).toBeInstanceOf(TypeTree);
        expect(tree.properties.item.type).toBe(Item);
        expect(tree.properties.item.properties.item).toBeInstanceOf(TypeTree);
        expect(tree.properties.item.properties.item.type).toBe(Item);
        expect(tree.properties.item.properties.item.path).toEqual(['item', 'item']);
      });
    });
    describe('arrays', () => {
      class Item {
        name = String;
      }
      let tree = new TypeTree([Item]);
      it('supports [<Type>] syntax', () => {
        has(tree, 'isComposed', true);
        has(tree, 'isPrimivite', false);
        has(tree, 'isParameterized', true);
        has(tree, 'isList', true);
        has(tree, 'properties', null);
        has(tree, 'schemaType', [Item]);
        has(tree, 'type', MicrostateParameterizedArray);
      });
      it('parameterized types converted to TypeTrees in `of` property', () => {
        let tree = new TypeTree([Item]);
        expect(tree.of[0]).toBeInstanceOf(TypeTree);
      });
    });
  });
});
