import 'jest';

import { map } from 'funcadelic';

import Tree from '../../src/utils/tree';

describe('Tree', () => {
  let tree, mapped, double;
  describe('with a single node', () => {
    beforeEach(() => {
      double = jest.fn(val => val * 2);
      tree = new Tree({ data: 5 });
    });

    describe('when mapped', function() {
      beforeEach(function() {
        mapped = map(double, tree);
      });
      it('does not invoke the callback eagerly', function() {
        expect(double).not.toHaveBeenCalled();
      });
      it('applies the function when it is needed', function() {
        expect(mapped.data).toEqual(10);
      });
    });
  });

  describe('with children', function() {
    beforeEach(function() {
      double = jest.fn(data => ({ num: data.num * 2 }));
      tree = new Tree({
        data: { num: 5 },
        children: {
          first: new Tree({ data: { num: 1 } }),
          second: new Tree({ data: { num: 2 } }),
        },
      });
    });
    describe('when mapped', () => {
      beforeEach(function() {
        mapped = map(double, tree);
      });
      it('maps the entire tree', function() {
        expect(mapped.children.first.data.num).toEqual(2);
        expect(mapped.children.second.data.num).toEqual(4);
      });
    });
    describe('when collapsed', function() {
      let collapsed;
      beforeEach(function() {
        collapsed = tree.collapsed;
      });
      it('merges the children up into their parent', function() {
        expect(collapsed.num).toEqual(5);
        expect(collapsed.first.num).toEqual(1);
        expect(collapsed.second.num).toEqual(2);
      });
    });
  });
});
