import "jest";

import { create } from "microstates";

describe("ArrayType", function() {
  describe("when unparameterized", function() {
    let ms;
    let array = ["a", "b", "c"];

    beforeEach(() => {
      ms = create(Array, array);
    });

    describe("push", () => {
      let pushed;
      beforeEach(() => {
        pushed = ms.push("d");
      });

      it("has value", () => {
        expect(pushed.valueOf()).toEqual(["a", "b", "c", "d"]);
      });

      it("has state", () => {
        expect(pushed.state).toEqual(["a", "b", "c", "d"]);
      });

      describe("again", () => {
        let again;

        beforeEach(() => {
          again = pushed.push("e");
        });

        it("has value", () => {
          expect(again.valueOf()).toEqual(["a", "b", "c", "d", "e"]);
        });

        it("has state", () => {
          expect(again.state).toEqual(["a", "b", "c", "d", "e"]);
        });
      });
    });

    describe("filter", () => {
      let filtered;

      beforeEach(() => {
        filtered = ms.filter(v => v.state !== "a");
      });

      it("value", () => {
        expect(filtered.valueOf()).toEqual(["b", "c"]);
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

      it("value", () => {
        expect(mapped.valueOf()).toEqual(["A", "B", "C"]);
      });

      it("state", () => {
        expect(mapped.valueOf()).toEqual(["A", "B", "C"]);
      });
    });
  });

  describe("when parameterized", () => {
    class Record {
      content = String;
    }
    class Dataset {
      records = [Record];
    }

    describe("empty data set", () => {
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
          expect(pushed.state.records[0]).toBeInstanceOf(Record);
        });

        it("has given value", () => {
          expect(pushed.state.records[0].content).toEqual("Hi!");
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = pushed.records[0].content.set("Hello!");
          });

          it("has changed value", () => {
            expect(changed.state.records[0].content).toBe("Hello!");
          });
        });
      });
    });

    describe("preloaded data set", () => {
      let dataset;
      beforeEach(() => {
        dataset = create(Dataset, {
          records: [
            { content: "Herro" },
            { content: "Sweet" },
            { content: "Woooo" }
          ]
        });
      });

      describe("push", () => {
        let pushed;
        beforeEach(() => {
          pushed = dataset.records.push({ content: "Hi!" });
        });

        it("has the new record", () => {
          expect(pushed.state.records[3]).toBeInstanceOf(Record);
        });

        it("has given value", () => {
          expect(pushed.state.records[3].content).toEqual("Hi!");
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = pushed.records[3].content.set("Hello!");
          });

          it("has changed value", () => {
            expect(changed.state.records[3].content).toBe("Hello!");
          });
        });
      });

      describe("shift", () => {
        let shifted;
        beforeEach(() => {
          shifted = dataset.records.shift();
        });

        it("removed first element from the array", () => {
          expect(shifted.records[0].content.state).toBe("Sweet");
        });

        it("changed length", () => {
          expect(shifted.records.state.length).toBe(2);
        });

        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = shifted.records[1].content.concat("!!!");
          });

          it("changed the content", () => {
            expect(changed.records[1].content.state).toBe("Woooo!!!");
          });
        });
      });

      describe("unshift", () => {
        let unshifted;
        beforeEach(() => {
          unshifted = dataset.records.unshift({ content: "Hi!" });
        });
        it("pushed record to the beginning of the array", () => {
          expect(unshifted.records[0].content.state).toBe("Hi!");
        });
        it("moved first record to second position", () => {
          expect(unshifted.records[1].content.state).toBe("Herro");
        });

        describe("change new record", () => {
          let changed;
          beforeEach(() => {
            changed = unshifted.records[0].content.concat("!!!");
          });
          it("changed new record", () => {
            expect(changed.records[0].content.state).toBe("Hi!!!!");
          });
        });

        describe("change existing record", () => {
          let changed;
          beforeEach(() => {
            changed = unshifted.records[1].content.concat("!!!");
          });
          it("changed new record", () => {
            expect(changed.records[1].content.state).toBe("Herro!!!");
          });
        });
      });

      describe("filter", () => {
        let filtered;
        beforeEach(() => {
          filtered = dataset.records.filter(record => record.state.content[0] === "S");
        });

        it("filtered out items", () => {
          expect(filtered.records.length).toBe(1);
        });

        describe("changing remaining item", () => {
          let changed;
          beforeEach(() => {
            changed = filtered.records[0].content.concat("!!!");
          });

          it("it changed the state", () => {
            expect(changed.records[0].content.state).toBe("Sweet!!!");
          });
        });
      });

      describe("map", () => {
        describe("with microstate operations", () => {
          let mapped;
          beforeEach(() => {
            mapped = dataset.records.map(record =>
              record.content.concat("!!!")
            );
          });

          it("applied change to every element", () => {
            expect(mapped.records[0].content.state).toBe("Herro!!!");
            expect(mapped.records[1].content.state).toBe("Sweet!!!");
            expect(mapped.records[2].content.state).toBe("Woooo!!!");
          });

          describe("changing record", () => {
            let changed;
            beforeEach(() => {
              changed = mapped.records[1].content.set("SWEET!!!");
            });

            it("changed the record content", () => {
              expect(changed.records[1].content.state).toBe("SWEET!!!");
            });
          });
        });

        describe("with new microstates", () => {
          let mapped;
          class SweetSweetRecord extends Record {}
          beforeEach(() => {
            mapped = dataset.records.map(record => {
              if (record.content.state === "Sweet") {
                return create(SweetSweetRecord, record);
              } else {
                return record;
              }
            });
          });

          it("changed type of the record", () => {
            expect(mapped.records[1].state).toBeInstanceOf(SweetSweetRecord);
          });

          it("did not change the uneffected item", () => {
            expect(dataset.records[0].state).toBe(mapped.records[0].state);
            expect(dataset.records[2].state).toBe(mapped.records[2].state);
          });
        });
      });

      describe("clear", () => {
        let cleared;
        beforeEach(() => {
          cleared = dataset.records.clear();
        });

        it("makes array empty", () => {
          expect(cleared.records.state).toEqual([]);
        });

        it("has empty value", () => {
          expect(cleared.valueOf()).toEqual({ records: [] });
        });
      });
    });
  });

  describe('reduce', () => {
    let numbers;
    beforeEach(() => {
      numbers = create(Array, [1, 2, 3, 4]);
    });
    it('throws an exception when initial value is not specified', () => {
      expect(function() {
        numbers.reduce()
      }).toThrowError(/reduce transition expects a reduce function as first argument, got undefined/)
    });
    it('throws an exception when initial value is not specified', () => {
      expect(function() {
        numbers.reduce(() => {})
      }).toThrowError(/reduce transition requires initial value as second arguement, got undefined/)
    });
    let sum;
    beforeEach(() => {
      sum = numbers.reduce((memo, value) => {
        return memo.increment(value);
      }, create(Number, 0))
    });
    it('sum has returned value', () => {
      expect(sum.state).toEqual(10);
    });
  })
});