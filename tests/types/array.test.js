import 'jest';

import ArrayType from '../../src/types/array';
import { create } from 'microstates';

describe('ArrayType', function() {
  let array = ['a', 'b', 'c'];

  describe('when unparameterized', function() {
    let ms;

    beforeEach(() => {
      ms = create(Array, array)
    });

    describe('push', () => {

      let pushed;
      beforeEach(() => {
        pushed = ms.push('d');
      });

      it('has value', () => {
        expect(pushed.valueOf()).toEqual(['a', 'b', 'c', 'd']);
      });

      it('has state', () => {
        expect(pushed.state).toEqual(['a', 'b', 'c', 'd']);
      });

      describe('again', () => {
        let again;

        beforeEach(() => {
          again = pushed.push('e');
        });

        it('has value', () => {
          expect(again.valueOf()).toEqual(['a', 'b', 'c', 'd', 'e']);
        });
  
        it('has state', () => {
          expect(again.state).toEqual(['a', 'b', 'c', 'd', 'e']);
        });
        
      });
  
    });

    describe('filter', () => {
      let filtered;

      beforeEach(() => {
        filtered = ms.filter(v => v !== 'a');
      });

      it('value', () => {
        expect(filtered.valueOf()).toEqual(['b', 'c']);
      });

      it('state', () => {
        expect(filtered.state).toEqual(['b', 'c']);
      });
    });

    describe('map', () => {
      let mapped;

      beforeEach(() => {
        mapped = ms.map(v => v.toUpperCase());
      });

      it('value', () => {
        expect(mapped.valueOf()).toEqual(['A', 'B', 'C']);
      });

      it('state', () => {
        expect(mapped.valueOf()).toEqual(['A', 'B', 'C']);
      });
    })

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

    it('can unshift value', function () {
      let unshifted = ms.unshift('d');
      expect(unshifted.valueOf()).toEqual(['d', 'a', 'b', 'c']);
      expect(unshifted.state.length).toEqual(4);
      expect(unshifted.state[0]).toBeInstanceOf(Thing);
    });

    it('can unshift values', function () {
      let unshifted = ms.unshift(['d', 'e']);
      expect(unshifted.valueOf()).toEqual(['d', 'e', 'a', 'b', 'c']);
      expect(unshifted.state.length).toEqual(5);
      expect(unshifted.state[0]).toBeInstanceOf(Thing);
      expect(unshifted.state[1]).toBeInstanceOf(Thing);
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
