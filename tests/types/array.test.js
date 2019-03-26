/* global describe, it, beforeEach */
import expect from 'expect';

import ArrayType from '../../src/types/array';
import { create } from '../../src/microstates';
import { valueOf } from '../../src/meta';
import { Store } from '../../index';

describe("ArrayType", function() {

  describe("created with a scalar value", () => {
    let ms;
    beforeEach(()=> {
      ms = create(ArrayType.of(Number), 1);
    });

    it('wraps the scalar value in an array', ()=> {
      expect(valueOf(ms)).toEqual([1]);
    });
  });

  describe("created with an iterator value", () => {
    let ms;
    beforeEach(()=> {
      let iterator = {
        0: 1,
        [Symbol.iterator]() {
          return [1][Symbol.iterator]();
        }
      };
      ms = create(ArrayType.of(Number), iterator);
    });

    it('does not wrap iterator in an array', ()=> {
      expect([...valueOf(ms)]).toEqual([1]);
    });

    it('result of pushing an item into the array', () => {
      expect([...valueOf(ms.push(10))]).toEqual([1, 10]);
    });
  });

  describe("when unparameterized", function() {
    let ms;
    let array = ["a", "b", "c"];

    beforeEach(() => {
      ms = create(ArrayType, array);
    });

    describe("push", () => {
      let pushed;
      beforeEach(() => {
        pushed = ms.push("d");
      });

      it("has state", () => {
        expect(valueOf(pushed)).toEqual(["a", "b", "c", "d"]);
      });

      describe("again", () => {
        let again;
        beforeEach(() => {
          again = pushed.push("e");
        });

        it("has state", () => {
          expect(valueOf(again)).toEqual(["a", "b", "c", "d", "e"]);
        });
      });

      describe('another microstate', function() {
        let again;
        beforeEach(function() {
          again = pushed.push(create(String, "e"));
        });

        it('uses the value of the microstate, not the microstate itself', function() {
          expect(valueOf(again)).toEqual(["a", "b", "c", "d", "e"]);
        });
      });

    });

    describe("pop", () => {
      let popped;
      beforeEach(() => {
        popped = ms.pop();
      });

      it("has state", () => {
        expect(valueOf(popped)).toEqual(["a", "b"]);
      });

      describe("again", () => {
        let again;
        beforeEach(() => {
          again = popped.pop();
        });

        it("has state", () => {
          expect(valueOf(again)).toEqual(["a"]);
        });
      });
    });

    describe("slice", () => {
      let sliced;
      beforeEach(() => {
        sliced = ms.slice(1);
      });

      it("has a sliced segment of the original list", () => {
        expect(valueOf(sliced)).toEqual(["b", "c"]);
      });

      it("returns the same array microstate if all of the values in the underlying array remains the same", () => {
        expect(sliced.slice(0)).toBe(sliced);
      });
    });

    describe("sort", () => {
      let sorted;

      beforeEach(() => {
        let unsorted = create([String], ["c", "b", "a"]);
        sorted = unsorted.sort();
      });

      it("has a value that is the sorted version of the original value", () => {
        expect(valueOf(sorted)).toEqual(["a", "b", "c"]);
      });

      it("returns the same array microstate if all of the values in the underlying array remains the same", () => {
        expect(sorted.sort()).toBe(sorted);
      });
    });

    describe("filter", () => {
      let filtered;
      beforeEach(() => {
        filtered = ms.filter(v => v.state !== "a");
      });

      it("state", () => {
        expect(valueOf(filtered)).toEqual(["b", "c"]);
      });

      it("returns the same array microstate if all of the values in the underlying array remains the same", () => {
        expect(filtered.filter(() => true)).toBe(filtered);
      });
    });

    describe("map", () => {
      let mapped;
      beforeEach(() => {
        mapped = ms.map(v => v.state.toUpperCase());
      });

      it("state", () => {
        expect(valueOf(mapped)).toEqual(["A", "B", "C"]);
      });

      it("returns the same object if the same microstate is returned", () => {
        expect(mapped.map(x => x)).toBe(mapped);
      });

      it("returns the same array microstate if all of the values in the underlying array remains the same", () => {
        expect(mapped.map(valueOf)).toBe(mapped);
      });
    });
  });

  describe("when parameterized", () => {
    class Record {
      content = String
    }
    class Dataset {
      records = create(ArrayType.of(Record), []);
    }

    describe('empty data set', () => {
      let dataset;
      beforeEach(() => {
        dataset = create(Dataset, { records: [] });
      });

      describe("pushing a record", () => {
        let pushed;
        beforeEach(() => {
          pushed = dataset.records.push({ content: "Hi!" });
        });

        it("has the new record", () => {
          let [ first ] = pushed.records;
          expect(first).toBeInstanceOf(Record);
        });

        it("has given value", () => {
          let [ first ] = pushed.records;
          expect(first.content.state).toBe("Hi!");
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            let [ first ] = pushed.records;
            changed = first.content.set("Hello!");
          });

          it("has changed value", () => {
            let [ first ] = changed.records;
            expect(first.content.state).toBe("Hello!");
          });

          describe("popping a record", () => {
            let popped;
            beforeEach(() => {
              popped = changed.records.pop();
            });

            it("does not have any records", () => {
              expect(popped.records).toHaveLength(0);
              expect(valueOf(popped.records)).toEqual([]);
            });
          });
        });
      });
    });

    describe('preloaded data set', () => {
      let dataset;
      beforeEach(() => {
        dataset = create(Dataset, { records: [
          {content: 'Herro'},
          {content: 'Sweet'},
          {content: "Woooo"}
        ]});
      });

      describe("push", () => {
        let pushed, fourth;
        beforeEach(() => {
          pushed = dataset.records.push({ content: "Hi!" });
          let first, second, third; // eslint-disable-line no-unused-vars
          [first, second, third, fourth] = pushed.records;
        });

        it("has the new record", () => {
          expect(fourth).toBeInstanceOf(Record);
        });

        it("has given value", () => {
          expect(fourth.content.state).toBe("Hi!");
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = fourth.content.set("Hello!");
          });

          it("has changed value", () => {
            let [first, second, third, fourth] = changed.records; // eslint-disable-line no-unused-vars
            expect(fourth.content.state).toBe("Hello!");
          });
        });
      });

      describe('pop', () => {
        let popped;
        beforeEach(() => {
          popped = dataset.records.pop();
        });

        it('removed last element from the array and changed length', () => {
          expect(popped.records).toHaveLength(2);
        });

        describe('changing record', () => {
          let changed;
          beforeEach(() => {
            let [ _, second ] = popped.records; // eslint-disable-line no-unused-vars
            changed = second.content.concat('!!!');
          });

          it('changed the content', () => {
            let [ _, second ] = changed.records; // eslint-disable-line no-unused-vars
            expect(second.content.state).toBe('Sweet!!!');
          });
        });
      });

      describe('shift', () => {
        let shifted;
        beforeEach(() => {
          shifted = dataset.records.shift();
        });

        it('removed first element from the array', () => {
          let [ first ] = shifted.records;
          expect(first.content.state).toBe('Sweet');
        });

        it('changed length', () => {
          expect(shifted.records).toHaveLength(2);
        });

        describe('changing record', () => {
          let changed;
          beforeEach(() => {
            let [ _, second ] = shifted.records; // eslint-disable-line no-unused-vars
            changed = second.content.concat('!!!');
          });

          it('changed the content', () => {
            let [ _, second ] = changed.records; // eslint-disable-line no-unused-vars
            expect(second.content.state).toBe('Woooo!!!');
          });
        });
      });

      describe('unshift', () => {
        let unshifted;
        beforeEach(() => {
          unshifted = dataset.records.unshift({ content: "Hi!" });
        });

        it('pushed record to the beginning of the array', () => {
          let [ first ] = unshifted.records;
          expect(first.content.state).toBe('Hi!');
        });

        it('moved first record to second position', () => {
          let [ _, second ] = unshifted.records; // eslint-disable-line no-unused-vars
          expect(second.content.state).toBe('Herro');
        });

        describe('change new record', () => {
          let changed;
          beforeEach(() => {
            let [ first ] = unshifted.records;
            changed = first.content.concat('!!!');
          });

          it('changed new record', () => {
            let [ first ] = changed.records;
            expect(first.content.state).toBe('Hi!!!!');
          });
        });

        describe('change existing record', () => {
          let changed;
          beforeEach(() => {
            let [_, second ] = unshifted.records; // eslint-disable-line no-unused-vars
            changed = second.content.concat('!!!');
          });

          it('changed new record', () => {
            let [_, second ] = changed.records; // eslint-disable-line no-unused-vars
            expect(second.content.state).toBe('Herro!!!');
          });
        });

        describe('a microstate', () => {
          beforeEach(()=> {
            unshifted = dataset.records.unshift(create(null, { content: "Hello World!" }));
          });


          it('uses the value of the microstate and not the microstate itself.', function() {
            let [ first ] = valueOf(unshifted.records);
            expect(first).toEqual({ content: 'Hello World!'});
          });
        });

      });

      describe('filter', () => {
        let filtered;
        beforeEach(() => {
          filtered = dataset.records.filter(record => record.content.state[0] === 'S');
        });

        it('filtered out items', () => {
          expect(filtered.records).toHaveLength(1);
        });

        describe('changing remaining item', () => {
          let changed;
          beforeEach(() => {
            let [ first ] = filtered.records;
            changed = first.content.concat('!!!');
          });

          it('it changed the state', () => {
            let [ first ] = changed.records;
            expect(first.content.state).toBe('Sweet!!!');
          });
        });
      });

      describe('map', () => {
        describe('with microstate operations', () => {
          let mapped;
          beforeEach(() => {
            mapped = dataset.records.map(record => record.content.concat('!!!'));
          });

          it('applied change to every element', () => {
            let [ first, second, third ] = mapped.records;
            expect(first.content.state).toBe('Herro!!!');
            expect(second.content.state).toBe('Sweet!!!');
            expect(third.content.state).toBe('Woooo!!!');
          });

          describe('changing record', () => {
            let changed;
            beforeEach(() => {
              let [_, second ] = mapped.records; // eslint-disable-line no-unused-vars
              changed = second.content.set('SWEET!!!');
            });

            it('changed the record content', () => {
              let [_, second ] = changed.records; // eslint-disable-line no-unused-vars
              expect(second.content.state).toBe('SWEET!!!');
            });
          });
        });
      });

      describe('clear', () => {
        let cleared;
        beforeEach(() => {
          cleared = dataset.records.clear();
        });

        it('makes array empty', () => {
          expect(cleared.records).toHaveLength(0);
        });

        it('has empty value', () => {
          expect(valueOf(cleared)).toEqual({ records: [] });
        });
      });
    });
  });

  describe('iteration', () => {
    let array, substates;
    beforeEach(() => {
      array = create([], [{a: "a"}, {b: "b"}, {c: "c"}]);
      [...substates] = array;
    });

    it('creates a substate for each element in the array', function() {
      expect(substates).toHaveLength(3);
    });

    it('has undefined as the value of a done iteration', function() {
      let iterator = array[Symbol.iterator]();
      iterator.next();
      iterator.next();
      iterator.next();
      let last = iterator.next();
      expect(last.done).toBe(true);
      expect(last.value).toBe(undefined);
    });

    describe('transitinging one of the substates', function() {
      let transitioned;
      beforeEach(() => {
        transitioned = substates[1].set({b: "bee"});
      });

      it('returns an array of the same number of elements', function() {
        expect(transitioned).toBeInstanceOf(ArrayType);
        expect(valueOf(transitioned)).toEqual([{a: "a"}, {b: "bee"}, {c: "c"}]);
      });
    });
  });

  describe('remove', () => {
    let array;
    beforeEach(() => {
      array = create([], ['a', 'b', 'c']);
    });

    it('allows to remove an element', () => {
      let [a, b, c] = array;
      let removed = array.remove(b);
      let [a2, c2] = removed;
      expect(removed.length).toBe(2);
      expect(valueOf(a)).toBe(valueOf(a2));
      expect(valueOf(c)).toBe(valueOf(c2));
    });

    it('returns same array when item is not found', () => {
      expect(array.remove(null)).toBe(array);
    });
  });

  describe('within a Store', ()=> {
    it('return undefined at the end of an iteration', ()=> {
      let array = Store(create([Number], [1,2]));
      let iterator = array[Symbol.iterator]();
      iterator.next();
      iterator.next();
      expect(iterator.next().value).toBe(undefined);
    });
  });

});
