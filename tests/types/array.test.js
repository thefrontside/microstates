import 'jest';

import ArrayType from '../../src/types/array';
import { create } from 'microstates';

describe('ArrayType', function() {
  let array = ['a', 'b', 'c'];

  describe('when unparameterized', function() {
    let ms = create(Array, array);

    it('constructor returns an array when receives another value', () => {
      expect(new ArrayType()).toEqual([]);
      expect(new ArrayType('foo')).toEqual(['foo']);
      expect(new ArrayType(false)).toEqual([false]);
    });

    it('constructor returns the array when one is passed', () => {
      expect(new ArrayType(array)).toBe(array);
    });

    it('pushes items', function() {
      let next = ms.push('d').push('e');
      expect(next.valueOf()).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(next.state).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('filter removes items', () => {
      expect(ms.filter(v => v !== 'a').valueOf()).toEqual(['b', 'c']);
    });

    it('map applies to every item', () => {
      expect(ms.map(v => v.toUpperCase()).valueOf()).toEqual(['A', 'B', 'C']);
    });
  });


  describe('when parameterized', function() {
    class Thing {}
    let ms = create([Thing], array);

    it('has instances of the state for each value in the array', function() {
      expect(ms.state.length).toBe(3);
      expect(ms.state[0]).toBeInstanceOf(Thing);
      expect(ms.state[1]).toBeInstanceOf(Thing);
      expect(ms.state[2]).toBeInstanceOf(Thing);
    });

    it('can push values', function() {
      let pushed = ms.push('d');
      expect(pushed.valueOf()).toEqual(['a', 'b', 'c', 'd']);
      expect(pushed.state.length).toEqual(4);
      expect(pushed.state[3]).toBeInstanceOf(Thing);
    });
    it('can pop values', function() {
      let popped = ms.pop();
      expect(popped.valueOf()).toEqual(['a', 'b']);
      expect(popped.state.length).toEqual(2);
      expect(popped.state[1]).toBeInstanceOf(Thing);
    });
    it('can unshift values', function () {
      let unshifted = ms.unshift('d');
      expect(unshifted.valueOf()).toEqual(['d', 'a', 'b', 'c']);
      expect(unshifted.state.length).toEqual(4);
      expect(unshifted.state[0]).toBeInstanceOf(Thing);
    });
    it('can shift values', function () {
      let shifted = ms.shift();
      expect(shifted.valueOf()).toEqual(['b', 'c']);
      expect(shifted.state.length).toEqual(2);
      expect(shifted.state[0]).toBeInstanceOf(Thing);
      expect(shifted.state[1]).toBeInstanceOf(Thing);
    });
  });
});
