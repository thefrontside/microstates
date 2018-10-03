import expect from 'expect';

import { create, first, second }  from "../index";

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
        m = first(create([Item], [{ isCompleted: false }])).isCompleted.toggle();
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
        expect(m.state).toEqual({items: []});
      });
    });

    describe('constructing a bare instance with embeded, parameterized objects', function() {
      let m;
      beforeEach(function() {
        m = create(TodoList);
      });
      it('has no items', function() {
        expect(m.state).toEqual({items: []});
      });
    });


    describe("composed [Item] to parameterized(Array)", function() {
      let m;
      beforeEach(function() {
        m = first(create(TodoList, {
          items: [{ isCompleted: false }]
        }).items).isCompleted.toggle();
      });
      it("runs transitions on sub items", function() {
        expect(first(m.state.items).isCompleted).toBe(true);
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
        transitioned = second(first(m.apples).increment().oranges).increment();
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
          second(first(m.inventory.apples).increment()
            .inventory.oranges).increment().state
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
      m = first(create(TodoList, {
        items: [
          { isCompleted: false, description: "Get Milk" },
          { isCompleted: false, description: "Feed Dog" }
        ]
      }).items).isCompleted.toggle();
    });
    it("runs transitions on sub items", function() {
      expect(m).toBeInstanceOf(TodoList);
      expect(m.state.items).toBeInstanceOf(Array);
      expect(m.state.items.length).toBe(2);
      expect(m.state.items[0].isCompleted).toBe(true);
      expect(first(m.items)).toBeInstanceOf(Item);
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
      expect(second(first(m.apples).increment().oranges).increment().state).toEqual({
        oranges: [50, 21],
        apples: [2, 2, 45]
      });
    });
  });
});
