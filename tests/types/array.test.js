import expect from 'expect';

import ArrayType from '../../src/types/array';
import { create } from '../../src/microstates';
import { first, second, third, at } from '../../index';

describe("ArrayType", function() {
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
        expect(pushed.state).toEqual(["a", "b", "c", "d"]);
      });

      describe("again", () => {
        let again;

        beforeEach(() => {
          again = pushed.push("e");
        });

        it("has state", () => {
          expect(again.state).toEqual(["a", "b", "c", "d", "e"]);
        });
      });
    });

    describe("pop", () => {
      let popped;
      beforeEach(() => {
        popped = ms.pop();
      });

      it("has state", () => {
        expect(popped.state).toEqual(["a", "b"]);
      });

      describe("again", () => {
        let again;

        beforeEach(() => {
          again = popped.pop();
        });

        it("has state", () => {
          expect(again.state).toEqual(["a"]);
        });
      });
    });

    describe("filter", () => {
      let filtered;

      beforeEach(() => {
        filtered = ms.filter(v => v.state !== "a");
      });

      it("state", () => {
        expect(filtered.state).toEqual(["b", "c"]);
      });
    });

    describe("map", () => {
      let mapped;

      beforeEach(() => {
        mapped = ms.map(v => v.state.toUpperCase());
      });

      it("state", () => {
        expect(mapped.state).toEqual(["A", "B", "C"]);
      });
    });
  });

  describe("when parameterized", () => {
    class Record {
      content = create(class StringType {
        concat(value) {
          return String(this.state) + String(value);
        }
      });
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
          expect(first(pushed.records)).toBeInstanceOf(Record);
        });

        it("has given value", () => {
          expect(first(pushed.state.records).content).toBe("Hi!");
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = first(pushed.records).content.set("Hello!");
          });

          it("has changed value", () => {
            expect(changed.state.records[0].content).toBe("Hello!");
          });

          describe("popping a record", () => {
            let popped;
            beforeEach(() => {
              popped = changed.records.pop();
            });

            it("does not have any records", () => {
              expect(popped.state.records[0]).toBe(undefined);
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
        let pushed;
        beforeEach(() => {
          pushed = dataset.records.push({ content: "Hi!" });
        });

        it("has the new record", () => {
          expect(at(pushed.records, 3)).toBeInstanceOf(Record);
        });

        it("has given value", () => {
          expect(pushed.state.records[3].content).toBe("Hi!");
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = at(pushed.records, 3).content.set("Hello!");
          });

          it("has changed value", () => {
            expect(changed.state.records[3].content).toBe("Hello!");
          });
        });
      });

      describe('pop', () => {
        let popped;
        beforeEach(() => {
          popped = dataset.records.pop();
        });

        it('removed last element from the array', () => {
          expect(third(popped.records, 2)).toBe(undefined);
        });

        it('changed length', () => {
          expect(popped.records.state.length).toBe(2);
        });

        describe('changing record', () => {
          let changed;
          beforeEach(() => {
            changed = second(popped.records).content.concat('!!!');
          });

          it('changed the content', () => {
            expect(second(changed.records).content.state).toBe('Sweet!!!');
          });
        });
      });

      describe('shift', () => {
        let shifted;
        beforeEach(() => {
          shifted = dataset.records.shift();
        });

        it('removed first element from the array', () => {
          expect(first(shifted.records).content.state).toBe('Sweet');
        });

        it('changed length', () => {
          expect(shifted.records.state.length).toBe(2);
        });

        describe('changing record', () => {
          let changed;
          beforeEach(() => {
            changed = second(shifted.records).content.concat('!!!');
          });

          it('changed the content', () => {
            expect(second(changed.records).content.state).toBe('Woooo!!!');
          });
        });
      });

      describe('unshift', () => {
        let unshifted;
        beforeEach(() => {
          unshifted = dataset.records.unshift({ content: "Hi!" });
        });
        it('pushed record to the beginning of the array', () => {
          expect(first(unshifted.records).content.state).toBe('Hi!');
        });
        it('moved first record to second position', () => {
          expect(second(unshifted.records).content.state).toBe('Herro');
        });

        describe('change new record', () => {
          let changed;
          beforeEach(() => {
            changed = first(unshifted.records).content.concat('!!!');
          });
          it('changed new record', () => {
            expect(first(changed.records).content.state).toBe('Hi!!!!');
          });
        });

        describe('change existing record', () => {
          let changed;
          beforeEach(() => {
            changed = second(unshifted.records).content.concat('!!!');
          });
          it('changed new record', () => {
            expect(second(changed.records).content.state).toBe('Herro!!!');
          });
        });
      });

      describe('filter', () => {
        let filtered;
        beforeEach(() => {
          filtered = dataset.records.filter(record => record.state.content[0] === 'S');
        });

        it('filtered out items', () => {
          expect(filtered.records.state.length).toBe(1);
        });

        describe('changing remaining item', () => {
          let changed;
          beforeEach(() => {
            changed = first(filtered.records).content.concat('!!!');
          });

          it('it changed the state', () => {
            expect(first(changed.records).content.state).toBe('Sweet!!!');
          });
        });
      });

      describe('map', () => {
        describe('with microstate operations', () => {
          let mapped;
          beforeEach(() => {
            mapped = dataset.records.map(record => record.content.concat('!!!'))
          });

          it('applied change to every element', () => {
            expect(first(mapped.records).content.state).toBe('Herro!!!');
            expect(second(mapped.records).content.state).toBe('Sweet!!!');
            expect(third(mapped.records).content.state).toBe('Woooo!!!');
          });

          describe('changing record', () => {
            let changed;
            beforeEach(() => {
              changed = second(mapped.records).content.set('SWEET!!!');
            });

            it('changed the record content', () => {
              expect(second(changed.records).content.state).toBe('SWEET!!!');
            });
          });
        });

        describe('with new microstates', () => {
          let mapped;
          class SweetSweetRecord extends Record {}
          beforeEach(() => {
            mapped = dataset.records.map(record => {
              if (record.content.state === 'Sweet') {
                return create(SweetSweetRecord, record);
              } else {
                return record;
              }
            });
          });

          it('changed type of the record', () => {
            expect(second(mapped.records)).toBeInstanceOf(SweetSweetRecord);
          });

          it('did not change the uneffected item', () => {
            expect(first(dataset.records).state).toBe(mapped.records[0].state);
            expect(third(dataset.records).state).toBe(mapped.records[2].state);
          });
        });
      });

      describe('clear', () => {
        let cleared;
        beforeEach(() => {
          cleared = dataset.records.clear();
        });

        it('makes array empty', () => {
          expect(cleared.records.state).toEqual([]);
        });

        it('has empty value', () => {
          expect(cleared.state).toEqual({ records: [] });
        });
      });
    });
  });
});
