import expect from 'expect';
import { create } from '../src/microstates';
import { map, reduce } from '../src/query';

import { TodoMVC } from './todomvc';

describe('arrayWrapper', function() {
  let todomvc
  describe('acts like an array', function() {
    beforeEach(function() {
      todomvc = create(TodoMVC, {
        todos: [
          {title: "Do Stuff"}
        ]
      })
    });

    it("array can be accessed with []", function() {
      expect(todomvc.todos[0].title.state).toEqual('Do Stuff')
    })

    it("array can be reduced", function() {
      expect(reduce(todomvc.todos, (acc, t) => [ ...acc, t.title.state ], [])[0]).toEqual('Do Stuff')
      expect(map(todomvc.todos, t => t.title.state)[0]).toEqual('Do Stuff')
    })
  })

  describe('state comes in as raw array', function() {
    beforeEach(function() {
      todomvc = create(TodoMVC, {
        todos: [
          {title: "Do Stuff"}
        ]
      })
    });

    it('list is set to the array', function() {
      expect(todomvc.todos.__list__.state.length).toEqual(1)
    });

    it('addl state can be set', function() {
      todomvc = todomvc.todos.someField.set('Goodbye')
      expect(todomvc.todos.__list__.state.length).toEqual(1)
      expect(todomvc.todos.someField.state).toEqual('Goodbye')
    });
  })

  describe('state comes in as map', function() {
    beforeEach(function() {
      todomvc = create(TodoMVC, {
        todos: {
          __list__: [
            {title: "Do Stuff"}
          ],
          someField: "Hello"
        }
      })
    });

    it('list is set to the array', function() {
      expect(todomvc.todos.__list__.state.length).toEqual(1)
    });

    it('addl state is set', function() {
      expect(todomvc.todos.someField.state).toEqual('Hello')
      todomvc = todomvc.todos.someField.set('Goodbye')
      expect(todomvc.todos.__list__.state.length).toEqual(1)
      expect(todomvc.todos.someField.state).toEqual('Goodbye')
    });
  })
});
