import expect from 'expect';

import Identity from '../src/identity';
import { create } from '../src/microstates';
import { valueOf } from '../src/meta';

import { TodoMVC, Todo } from './todomvc';

describe('Identity', () => {
  let id;
  let microstate;
  beforeEach(function() {
    microstate = create(TodoMVC)
      .todos.push({ title: "Take out The Milk", completed: true })
      .todos.push({ title: "Convince People Microstates is awesome" })
      .todos.push({ title: "Take out the Trash" })
      .todos.push({ title: "profit $$"});
    id = Identity(microstate);
  });

  it('is derived from its source object', function() {
    expect(id).toBeInstanceOf(TodoMVC);
  });

  it('has the same shape as the initial state.', function() {
    expect(id.completeAll).toBeInstanceOf(Function);
    expect(id.todos.length).toBe(4);

    let [ first ] = id.todos;
    let [ $first ] = microstate.todos;
    expect(first).toBeInstanceOf(Todo);
    expect(valueOf(first)).toBe(valueOf($first))
  });

  describe('invoking a transition', function() {
    let next, third;
    beforeEach(function() {
      [ ,, third ] = id.todos;

      next = third.completed.set(true);
    });
    it('transitions the nodes which did change', function() {
      expect(next).not.toBe(id);
      expect(next.todos).not.toBe(id.todos);
      let [ ,, $third] = next.todos;
      expect($third).not.toBe(third);
    });
    it('maintains the === identity of the nodes which did not change', function() {
      let [first, second, third, fourth] = id.todos;
      let [$first, $second, $third, $fourth] = next.todos;
      expect($third.title).toBe(third.title);
      expect($first).toBe(first);
      expect($second).toBe(second);
      expect($fourth).toBe(fourth);
    });
  });


  describe('implicit method binding', function() {
    let next;
    beforeEach(function() {
      let shift = id.todos.shift;
      next = shift();
    });
    it('still completes the transition', function() {
      expect(valueOf(next)).toEqual({
        todos: [{
          title: "Convince People Microstates is awesome"
        }, {
          title: "Take out the Trash"
        }, {
          title: "profit $$"
        }]
      })
    });
  });

  describe('transition stability', function() {
    let next;
    beforeEach(function() {
      let [ first ] = id.todos;
      next = first.completed.set(false);
    });
    it('uses the same function for each location in the graph, even for different instances', function() {
      expect(next).not.toBe(id);
      expect(next.set).toBe(id.set);

      let [ first ] = id.todos;
      let [ $first ] = next.todos;

      expect($first.push).toBe(first.push);
      expect($first.completed.toggle).toBe(first.completed.toggle);
    });
  });


  describe('the identity callback function', function() {
    let args;
    let store;
    beforeEach(function() {
      store = Identity(microstate, () => undefined);
    });

    it('ignores the return value of the callback function when determining the value of the store', function() {
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(TodoMVC);
    });
  });

  describe('idempotency', function() {
    let calls;
    let store;
    let next;
    beforeEach(function() {
      calls = 0;
      store = Identity(microstate, x => {
        calls++;
        return x;
      });
      let [ first ] = store.todos;
      next = first.completed.set(true);
    });

    it('returns the same id in the event that the state is the same', function() {
      expect(next).toBe(store);
    });
    it('does not invoke the idenity function after the initial invocation', function() {
      expect(calls).toEqual(1);
    });
  });
  describe('identity of queries', function() {

    it('traverses queries and includes the microstates within them', function() {
      expect(id.completed).toBeDefined();
      let [ firstCompleted ] = id.completed;
      expect(firstCompleted).toBeInstanceOf(Todo);
    });

    describe('the effect of transitions on query identities', () => {
      let next;
      beforeEach(function() {
        let [ first ] = id.completed;
        next = first.title.set('Take out the milk');
      });

      it('updates those queries which contain changed objects, but not ids *within* the query that remained the same', () => {
        let [first, second] = id.completed;
        let [$first, $second] = next.completed;
        expect(next.completed).not.toBe(id.completed);
        expect($first).not.toBe(first);
        expect($second).toBe(second);
      });

      it.skip('maintains the === identity of those queries which did not change', function() {
        let [first, second] = id.active;
        let [$first, $second] = next.active;
        expect($first).toBe(first);
        expect($second).toBe(second);
        expect(next.active).toBe(id.active)
      });

      it('maintains the === identity of the same node that appears at different spots in the tree', () => {
        let [ first ] = id.todos;
        let [ firstCompleted ] = id.completed;
        let [ $first ] = next.todos;
        let [ $firstCompleted ] = next.completed;
        expect(first).toBe(firstCompleted);
        expect($first).toBe($firstCompleted);
      })
    })
  });
})
