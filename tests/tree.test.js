import 'jest';

import * as MS from '../src';
import Tree from '../src/utils/tree';

describe('tree', () => {
  it('instantiates without params', () => {
    expect(() => {
      new Tree();
    }).not.toThrow();
  });
  describe('from', () => {
    it('number', () => {
      expect(Tree.from(42)).toMatchObject({
        data: {
          Type: MS.Number,
        },
      });
    });
    it('string', () => {
      expect(Tree.from('hello world')).toMatchObject({
        data: {
          Type: MS.String,
        },
      });
    });
    it('boolean', () => {
      expect(Tree.from(true)).toMatchObject({
        data: {
          Type: MS.Boolean,
        },
      });
    });
    it('array', () => {
      expect(Tree.from(['a', 'b', 'c'])).toMatchObject({
        data: {
          Type: MS.Array,
        },
      });
    });
    describe('object', () => {
      it('converts to type', () => {
        expect(Tree.from({})).toMatchObject({
          data: {
            Type: expect.any(Function),
          },
        });
      });
      it('composes properties', () => {
        expect(
          Tree.from({
            n: 10,
            s: 'hello',
            b: true,
            a: ['a', 'b', 'c'],
          })
        ).toMatchObject({
          data: {
            Type: expect.any(Function),
          },
          children: {
            n: {
              data: {
                Type: MS.Number,
                path: ['n'],
              },
            },
            s: {
              data: {
                Type: MS.String,
                path: ['s'],
              },
            },
            b: {
              data: {
                Type: MS.Boolean,
                path: ['b'],
              },
            },
            a: {
              data: {
                Type: MS.Array,
                path: ['a'],
              },
            },
          },
        });
      });
    });
  });
});
