import { expect } from 'chai';

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
    expect(id).to.be.instanceof(TodoMVC);
  });

  it('has the same shape as the initial state.', function() {
    expect(id.completeAll).to.be.instanceof(Function);
    expect(id.todos.state.length).to.be.equal(4);
    expect(id.todos[0]).to.be.instanceof(Todo);
    expect(id.todos[0].state).to.equal(picostate.todos[0].state)
  });

  describe('invoking a transition', function() {
    let next;
    beforeEach(function() {
      next = id.todos[2].completed.set(true);
    });
    it('transitions the nodes which did change', function() {
      expect(next).to.not.equal(id);
      expect(next.todos).to.not.equal(id.todos);
      expect(next.todos[2]).to.not.equal(id.todos[2]);
    });
    it('maintains the === identity of the nodes which did not change', function() {
      expect(next.todos[2].title).to.equal(id.todos[2].title);
      expect(next.todos[0]).to.equal(id.todos[0]);
      expect(next.todos[1]).to.equal(id.todos[1]);
      expect(next.todos[3]).to.equal(id.todos[3]);
    });

  });

})
