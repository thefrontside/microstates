import expect from 'expect';

import Identity from '../src/identity';
import { create } from '../src/picostates';

import { TodoMVC, Todo } from './todomvc';

describe('Identity', () => {
  let id;
  let picostate;
  beforeEach(function() {
    picostate = create(TodoMVC)
      .todos.push({title: "Take out The Milk"})
      .todos.push({title: "Convince People Microstates is awesome"})
      .todos.push({title: "Take out the Trash"})
      .todos.push({title: "profit $$"});
    id = Identity(picostate);
  });

  it('is derived from its source object', function() {
    expect(id).toBeInstanceOf(TodoMVC);
  });

  it('has the same shape as the initial state.', function() {
    expect(id.completeAll).toBeInstanceOf(Function);
    expect(id.todos.state.length).toBe(4);
    expect(id.todos[0]).toBeInstanceOf(Todo);
    expect(id.todos[0].state).toBe(picostate.todos[0].state)
  });

  describe('invoking a transition', function() {
    let next;
    beforeEach(function() {
      next = id.todos[2].completed.set(true);
    });
    it('transitions the nodes which did change', function() {
      expect(next).not.toBe(id);
      expect(next.todos).not.toBe(id.todos);
      expect(next.todos[2]).not.toBe(id.todos[2]);
    });
    it('maintains the === identity of the nodes which did not change', function() {
      expect(next.todos[2].title).toBe(id.todos[2].title);
      expect(next.todos[0]).toBe(id.todos[0]);
      expect(next.todos[1]).toBe(id.todos[1]);
      expect(next.todos[3]).toBe(id.todos[3]);
    });

  });

})
