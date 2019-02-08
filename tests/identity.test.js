/* global describe, it, beforeEach */
import expect from 'expect';

import Identity from '../src/identity';
import { create } from '../src/microstates';
import { valueOf } from '../src/meta';
import from from '../src/literal';

import { TodoMVC, Todo } from './todomvc';

describe('Identity', () => {

  describe('complex type', () => {
    let id;
    let microstate;
    let latest;
    beforeEach(function() {
      microstate = create(TodoMVC)
        .todos.push({ title: "Take out The Milk", completed: true })
        .todos.push({ title: "Convince People Microstates is awesome" })
        .todos.push({ title: "Take out the Trash" })
        .todos.push({ title: "profit $$"});
      latest = id = Identity(microstate, x => latest = x);
    });

    it('is derived from its source object', function() {
      expect(id).toBeInstanceOf(TodoMVC);
    });

    it('has the same shape as the initial state.', function() {
      expect(id.completeAll).toBeInstanceOf(Function);
      expect(id.todos).toHaveLength(4);

      let [ first ] = id.todos;
      let [ $first ] = microstate.todos;
      expect(first).toBeInstanceOf(Todo);
      expect(valueOf(first)).toBe(valueOf($first));
    });

    describe('invoking a transition', function() {
      let third;
      beforeEach(function() {
        [ ,, third ] = id.todos;

        third.completed.set(true);
      });

      it('transitions the nodes which did change', function() {
        expect(latest).not.toBe(id);
        expect(latest.todos).not.toBe(id.todos);
        let [ ,, $third] = latest.todos;
        expect($third).not.toBe(third);
      });

      it('maintains the === identity of the nodes which did not change', function() {
        let [first, second, third, fourth] = id.todos;
        let [$first, $second, $third, $fourth] = latest.todos;
        expect($third.title).toBe(third.title);
        expect($first).toBe(first);
        expect($second).toBe(second);
        expect($fourth).toBe(fourth);
      });
    });

    describe('implicit method binding', function() {
      beforeEach(function() {
        let shift = id.todos.shift;
        shift();
      });

      it('still completes the transition', function() {
        expect(valueOf(latest)).toEqual({
          todos: [{
            title: "Convince People Microstates is awesome"
          }, {
            title: "Take out the Trash"
          }, {
            title: "profit $$"
          }]
        });
      });
    });

    describe('transition stability', function() {
      beforeEach(function() {
        let [ first ] = id.todos;
        first.completed.set(false);
      });

      it('uses the same function for each location in the graph, even for different instances', function() {
        expect(latest).not.toBe(id);
        expect(latest.set).toBe(id.set);

        let [ first ] = id.todos;
        let [ $first ] = latest.todos;

        expect($first.push).toBe(first.push);
        expect($first.completed.toggle).toBe(first.completed.toggle);
      });
    });

    describe('the identity callback function', function() {
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
      beforeEach(function() {
        calls = 0;
        store = Identity(microstate, x => {
          calls++;
          return x;
        });
        let [ first ] = store.todos;
        first.completed.set(true);
      });

      it('does not invoke the idenity function on initial invocation', function() {
        expect(calls).toEqual(0);
      });
    });

    describe('identity of queries', function() {
      it('traverses queries and includes the microstates within them', function() {
        expect(id.completed).toBeDefined();
        let [ firstCompleted ] = id.completed;
        expect(firstCompleted).toBeInstanceOf(Todo);
      });

      describe('the effect of transitions on query identities', () => {
        beforeEach(function() {
          let [ first ] = id.completed;
          first.title.set('Take out the milk');
        });

        it('updates those queries which contain changed objects, but not ids *within* the query that remained the same', () => {
          let [first, second] = id.completed;
          let [$first, $second] = latest.completed;
          expect(latest.completed).not.toBe(id.completed);
          expect($first).not.toBe(first);
          expect($second).toBe(second);
        });

        it.skip('maintains the === identity of those queries which did not change', function() {
          let [first, second] = id.active;
          let [$first, $second] = latest.active;
          expect($first).toBe(first);
          expect($second).toBe(second);
          expect(latest.active).toBe(id.active);
        });

        it('maintains the === identity of the same node that appears at different spots in the tree', () => {
          let [ first ] = id.todos;
          let [ firstCompleted ] = id.completed;
          let [ $first ] = latest.todos;
          let [ $firstCompleted ] = latest.completed;
          expect(first).toBe(firstCompleted);
          expect($first).toBe($firstCompleted);
        });
      });
    });
  });

  describe('identity support of type reuse', () => {
    class Person {
      name = String;
      father = Person;
      mother = Person;
    }

    it('it keeps both branches', () => {
      let s = Identity(create(Person), latest => (s = latest));
      let { name, father, mother } = s;

      name.set('Bart');
      father.name.set('Homer');
      mother.name.set('Marge');

      expect({
        name: s.name.state,
        father: { name: s.father.name.state },
        mother: { name: s.mother.name.state }
      }).toEqual({
        name: 'Bart',
        father: { name: 'Homer' },
        mother: { name: 'Marge' }
      });
    });
  });

  describe('identity support for microstates created with from(object)', () => {
    let i;
    beforeEach(() => {
      i = Identity(from({ name: 'Taras' }), latest => i = latest);
      i.name.concat('!!!');
    });
    it('allows to transition value of a property', () => {
      expect(i.name.state).toBe('Taras!!!');
    });
  });

  describe('supports destructuring inherited transitions', () => {
    class Parent {
      a = String;
      setA(str) {
        return this.a.set(str);
      }
    }
    class Child extends Parent {}

    let i, setA;
    beforeEach(() => {
      i = Identity(create(Child), latest => i = latest);
      setA = i.setA;
    });

    it('allows invoking a transition', () => {
      setA('taras');
      expect(i.a.state).toEqual('taras');
    });
  });
});
