import expect from 'expect';
import { Tree } from '../src/tree';

describe('tree', function() {

  let tree, mapped, PlaceHolder;
  beforeEach(function() {
    class MyTree {
      constructor(attrs) {
        Object.assign(this, attrs);
      }
    }

    Tree.instance(MyTree, {
      childrenOf(tree) { return tree; }
    })

    class LoudTree {
      constructor(attrs) {
        Object.assign(this, attrs);
      }
    }

    Tree.instance(LoudTree, {
      childrenOf(tree) {
        return Object.keys(tree).reduce((children, key) => {
          return Object.assign(children, { [key.toUpperCase()]: tree[key] });
        }, {});
      }
    });
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

    mapped = Tree.map(object => new PlaceHolder(), tree);
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
