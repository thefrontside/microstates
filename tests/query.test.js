import { expect } from 'chai';
import { create } from '../src/picostates';
import ArrayType from '../src/array';
import { filter } from 'funcadelic';

import { TodoMVC } from './todomvc';

describe('A Picostate with queries', function() {
  let todomvc
  beforeEach(function() {
    todomvc = create(TodoMVC)
      .todos.push({title: "Take out The Milk"})
      .todos.push({title: "Convince People Microstates is awesome"})
      .todos.push({title: "Take out the Trash"})
      .todos.push({title: "profit $$"})
      .todos[0].toggle()
      .todos[2].toggle()
  });
  it('can partition an array microstate using filter', function() {
    expect(todomvc.completed.length).to.equal(2)
    expect(todomvc.completed[0]).to.equal(todomvc.todos[0])
    expect(todomvc.completed[1]).to.equal(todomvc.todos[2])
    expect(todomvc.active.length).to.equal(2)
    expect(todomvc.active[0]).to.equal(todomvc.todos[1])
    expect(todomvc.active[1]).to.equal(todomvc.todos[3])
  });

  describe('invoking a transition from one of the object returned by a query.', function() {
    let next;
    beforeEach(function() {
      next = todomvc.active[0].toggle()
    });
    it('has the desired effect on the original item', function() {
      expect(next.todos[1].completed.state).to.equal(true);
      expect(next.active.length).to.equal(1)
      expect(next.completed.length).to.equal(3)
    });
  });
});
