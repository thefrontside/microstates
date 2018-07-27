import expect from 'expect';
import { treemap } from '../src/tree';

describe('tree', function() {

  let tree, mapped, PlaceHolder;
  beforeEach(function() {
    class MyTree {
      static childrenOf = (tree) => tree;

      constructor(attrs) {
        Object.assign(this, attrs);
      }
    }

    class LoudTree {
      static childrenOf = (tree) => {
        return Object.keys(tree).reduce((children, key) => {
          return Object.assign(children, { [key.toUpperCase()]: tree[key] });
        }, {});
      }
      constructor(attrs) {
        Object.assign(this, attrs);
      }
    }

    let array = ['me is array']
    tree = new MyTree({
      boolean: true,
      number: 10,
      object: { the: 'object'},
      array: ['me = array'],
      null: null,
      undefined: undefined,
      loudly: new LoudTree({
        number: 42
      }),
      other: new MyTree({
        one: 1,
        two: 2
      }),
      empty: new LoudTree({})
    });

    PlaceHolder = class PlaceHolder {}

    let visit = object => object instanceof MyTree || object instanceof LoudTree;
    function childrenOf(object) {
      return object.constructor.childrenOf(object);
    }

    mapped = treemap(visit, childrenOf, object => new PlaceHolder(), tree);
  });

  it('maps the tree', function() {
      expect(mapped).toEqual({
        boolean: true,
        number: 10,
        object: { the: 'object' },
        array: ['me = array'],
        null: null,
        undefined: undefined,
        loudly: {
          NUMBER: 42
        },
        other: {
          one: 1,
          two: 2
        },
        empty: {}
      });
    expect(mapped.object).toBe(tree.object);
    expect(mapped.array).toBe(tree.array);
    expect(mapped.loudly).toBeInstanceOf(PlaceHolder)
    expect(mapped.other).toBeInstanceOf(PlaceHolder)
    expect(mapped.empty).toBeInstanceOf(PlaceHolder)
    })
});
