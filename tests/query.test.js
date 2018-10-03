import expect from 'expect';
import { create } from '../src/microstates';
import { map, filter, reduce, first, second, third, at } from '../index';
import { TodoMVC } from './todomvc';

describe('A Microstate with queries', function() {
  let todomvc
  beforeEach(function() {
    todomvc = third(first(create(TodoMVC)
                    .todos.push({title: "Take out The Milk"})
                    .todos.push({title: "Convince People Microstates is awesome"})
                    .todos.push({title: "Take out the Trash"})
                    .todos.push({title: "profit $$"})
                    .todos).toggle()
                    .todos).toggle()
  });
  it('can partition an array microstate using filter', function() {
    expect(todomvc.completed.length).toEqual(2)
    expect(first(todomvc.completed)).toEqual(first(todomvc.todos))
    expect(second(todomvc.completed)).toEqual(third(todomvc.todos))
    expect(todomvc.active.length).toEqual(2)
    expect(first(todomvc.active)).toEqual(second(todomvc.todos))
    expect(second(todomvc.active)).toEqual(at(todomvc.todos, 3))
  });

  describe('invoking a transition from one of the object returned by a query.', function() {
    let next;
    beforeEach(function() {
      next = first(todomvc.active).toggle()
    });
    it('has the desired effect on the original item', function() {
      expect(second(next.todos).completed.state).toEqual(true);
      expect(next.active.length).toEqual(1)
      expect(next.completed.length).toEqual(3)
    });
  });
});

describe('Query Array', () => {
  let array = [true, false, true];
  it('can reduce a regular array', () => {
    expect(reduce(array, (acc, bool) => bool ? ++acc : acc, 0)).toBe(2);
  });
  it('can map a regular array', () => {
    expect(map(array, bool => !bool)).toEqual([false, true, false]);
  });
  it('can filter a regular array', () => {
    expect(filter(array, Boolean)).toEqual([true, true]);
  });
});
