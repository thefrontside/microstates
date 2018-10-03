import expect from 'expect';

import { create }  from "../index";
describe("Parameterized Microstates: ", () => {
  describe("sugar", function() {
    class Item {
      isCompleted = Boolean;
    }

    class TodoList {
      items = [Item];
    }

    describe("root [Item] to parameterized(Array)", function() {
      let m;
      beforeEach(function() {
        m = create([Item], [{ isCompleted: false }])[0].isCompleted.toggle();
      });
      it("runs transitions on sub items", function() {
        expect(m.state[0].isCompleted).toBe(true);
      });
    });

    describe('constructing a bare instance with embeded, parameterized arrays', function() {
      let m;
      beforeEach(function() {
        m = create(TodoList);
      });
      it('has no items', function() {
        expect(m.items.state).toEqual([]);
      });
    });

    describe('constructing a bare instance with embeded, parameterized objects', function() {
      let m;
      beforeEach(function() {
        m = create(TodoList);
      });
      it('has no items', function() {
        expect(m.items.state).toEqual([]);
      });
    });


    describe("composed [Item] to parameterized(Array)", function() {
      let m;
      beforeEach(function() {
        m = create(TodoList, {
          items: [{ isCompleted: false }]
        }).items[0].isCompleted.toggle();
      });
      it("runs transitions on sub items", function() {
        expect(m.state.items[0].isCompleted).toBe(true);
      });
    });

    describe("root {[Number]} to parameterized(Object, parameterized(Array, Number))", function() {
      let Numbers = [Number];
      let Counters = { Numbers };
      let value = {
        oranges: [50, 20],
        apples: [1, 2, 45]
      };
      let m;
      let transitioned;
      beforeEach(function() {
        m = create(Counters, value);
        transitioned = m.apples[0].increment().oranges[1].increment();
      });
      it("uses the same value for state as the value ", function() {
        expect(m.state).toBe(value);
      });
      it("still respects transitions", function() {
        let value = {
          oranges: [50, 21],
          apples: [2, 2, 45]
        };
        expect(transitioned.state).toEqual(value);
      });
    });

    describe("composed {[Number]} to parameterized(Object, parameterized(Array, Number))", function() {
      let Numbers = [Number];
      class Store {
        inventory = { Numbers };
      }
      let m, value;
      beforeEach(function() {
        value = {
          inventory: {
            oranges: [50, 20],
            apples: [1, 2, 45]
          }
        };
        m = create(Store, value);
      });
      it("still respects transitions", function() {
        expect(
          m.inventory.apples[0].increment()
            .inventory.oranges[1].increment().state
        ).toEqual({
          inventory: {
            oranges: [50, 21],
            apples: [2, 2, 45]
          }
        });
      });
    });
  });

  describe("with complex parameters", function() {
    let TodoList, Item, m;
    beforeEach(function() {
      Item = class Item {
        isCompleted = Boolean;
        description = String;
      };
      TodoList = class TodoList {
        items = [Item];
      };
      m = create(TodoList, {
        items: [
          { isCompleted: false, description: "Get Milk" },
          { isCompleted: false, description: "Feed Dog" }
        ]
      }).items[0].isCompleted.toggle();
    });
    it("runs transitions on sub items", function() {
      expect(m).toBeInstanceOf(TodoList);
      expect(m.state.items).toBeInstanceOf(Array);
      expect(m.state.items.length).toBe(2);
      expect(m.state.items[0].isCompleted).toBe(true);
      expect(m.items[0]).toBeInstanceOf(Item);
      expect(m.state.items[1].isCompleted).toBe(false);
    });
  });

  describe("with simple parameters", function() {
    let m, value;
    beforeEach(function() {
      let PriceList = create({}).constructor.Type.of([Number]);
      value = {
        oranges: [50, 20],
        apples: [1, 2, 45]
      };
      m = create(PriceList, value);
    });
    it("uses the same value for state as the value ", function() {
      expect(m.state).toEqual(value);
    });

    it("still respects transitions", function() {
      expect(m.apples[0].increment().oranges[1].increment().state).toEqual({
        oranges: [50, 21],
        apples: [2, 2, 45]
      });
    });
  });
});
