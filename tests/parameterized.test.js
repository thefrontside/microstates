import expect from 'expect';

import { create }  from "../index";
import { valueOf, metaOf } from "../src/meta";

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
        let [ first ] = create([Item], [{ isCompleted: false }]);
        m = first.isCompleted.toggle();
      });
      it("runs transitions on sub items", function() {
        let [ first ] = m
        expect(first.isCompleted.state).toBe(true);
      });
    });

    describe('constructing a bare instance with embeded, parameterized arrays', function() {
      let m;
      beforeEach(function() {
        m = create(TodoList);
      });
      it('has no items', function() {
        expect(m.items.length).toEqual(0);
      });
    });

    describe('constructing a bare instance with embeded, parameterized objects', function() {
      let m;
      beforeEach(function() {
        m = create(TodoList);
      });
      it('has no items', function() {
        expect(m.items.length).toEqual(0);
      });
    });


    describe("composed [Item] to parameterized(Array)", function() {
      let m;
      beforeEach(function() {
        let [ first ] = create(TodoList, {
          items: [{ isCompleted: false }]
        }).items
        m = first.isCompleted.toggle();
      });
      it("runs transitions on sub items", function() {
        let [ first ] = m.items;
        expect(first.isCompleted.state).toBe(true);
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
        let [ firstApple] = m.apples;
        let [ _, secondOrange ] = firstApple.increment().oranges;
        transitioned = secondOrange.increment();
      });
      it("uses the same value for state as the value ", function() {
        expect(valueOf(m)).toBe(value);
      });
      it("still respects transitions", function() {
        let value = {
          oranges: [50, 21],
          apples: [2, 2, 45]
        };
        let [ first ] = transitioned.apples;
        expect(valueOf(transitioned)).toEqual(value);
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
        let [ firstApple] = m.inventory.apples;
        let [ _, secondOrange ] = firstApple.increment().inventory.oranges;
        let next = secondOrange.increment();
        expect(valueOf(next)).toEqual({
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
      let [ first ] = create(TodoList, {
        items: [
          { isCompleted: false, description: "Get Milk" },
          { isCompleted: false, description: "Feed Dog" }
        ]
      }).items;
      m = first.isCompleted.toggle();
    });
    it("runs transitions on sub items", function() {
      expect(m).toBeInstanceOf(TodoList);
      expect(m.items.length).toBe(2);
      let value = valueOf(m);
      expect(value.items[0].isCompleted).toBe(true);

      let [ first, second ] = m.items;
      expect(first).toBeInstanceOf(Item);
      expect(second.isCompleted.state).toBe(false);
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

    it("still respects transitions", function() {
      let [ firstApple] = m.apples;
      let [ _, secondOrange ] = firstApple.increment().oranges;
      let next = secondOrange.increment();
      expect(valueOf(next)).toEqual({
        oranges: [50, 21],
        apples: [2, 2, 45]
      });
    });
  });
});
