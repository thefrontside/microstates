import "jest";

import { create, parameterized } from 'microstates';

describe('Parameterized Microstates: ', () => {
  describe('with complex parameters', function() {
    let TodoList, Item, m;
    beforeEach(function() {
      Item = class Item {
        isCompleted = Boolean;
        description = String
      };
      TodoList = class TodoList {
        items = parameterized(Array, Item);
      };
      m = create(TodoList, {
        items: [
          {isCompleted: false, description: "Get Milk"},
          {isCompleted: false, description: "Feed Dog"}
        ]
      }).items[0].isCompleted.toggle();
    });
    it('runs transitions on sub items', function() {
      expect(m.state).toBeInstanceOf(TodoList);
      expect(m.state.items).toBeInstanceOf(Array);
      expect(m.state.items.length).toBe(2);
      expect(m.state.items[0].isCompleted).toBe(true);
      expect(m.state.items[0]).toBeInstanceOf(Item);
      expect(m.state.items[1].isCompleted).toBe(false);
    });
  });

  describe('with simple parameters', function() {
    let m, value;
    beforeEach(function() {
      let PriceList = parameterized(Object, parameterized(Array, Number));
      value = {
        oranges: [50, 20],
        apples: [1, 2, 45]
      };
      m = create(PriceList, value);
    });
    it('uses the same value for state as the value ', function() {
      expect(m.state).toEqual(m.valueOf());
    });

    it('still respects transitions', function() {
      expect(m.apples[0].increment()
             .oranges[1].increment().state).toEqual({
               oranges: [50, 21],
               apples: [2, 2, 45]
             });
    });

  });


});
