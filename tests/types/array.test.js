import "jest";

import ArrayType from "../../src/types/array";
import { create, reveal } from "microstates";

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
        filtered = ms.filter(v => v !== "a");
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
        mapped = ms.map(v => v.toUpperCase());
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

    describe('preloaded data set', () => {
      let dataset;
      beforeEach(() => {
        dataset = create(Dataset, { records: [
          {content: 'Herro'}
        ]});
      });
  
      describe("pushing a record", () => {
        let pushed;
        beforeEach(() => {
          pushed = dataset.records.push({ content: "Hi!" });
        });
  
        it("has the new record", () => {
          expect(pushed.state.records[1]).toBeInstanceOf(Record);
        });
  
        it("has given value", () => {
          expect(pushed.state.records[1].content).toEqual("Hi!");
        });
  
        describe("changing record", () => {
          let changed;
          beforeEach(() => {
            changed = pushed.records[1].content.set("Hello!");
          });
  
          it("has changed value", () => {
            expect(changed.state.records[1].content).toBe("Hello!");
          });
        });
      });
    });
  });

});
