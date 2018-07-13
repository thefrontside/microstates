import expect from 'expect';
import Tree from '../src/tree';
import { create, Meta } from '../src/microstates';
import { map } from 'funcadelic';

import { TodoMVC, Todo  } from './todomvc';

describe('tree', function() {
  let app, mapped;
  beforeEach(function() {
    app = create(TodoMVC)
      .todos.push({title: "Take out The Milk", completed: true })
      .todos.push({title: "Convince People Microstates is awesome"});

    mapped = map(microstate => ({ path: Meta.get(microstate).path }), Tree(app)).object;
  });

  it('maps the tree into an object of similar structure', function() {

    expect(mapped).toEqual({
      path: [],
      todos: {
        path: ['todos'],
        0: {
          path: ['todos', 0],
          title: {
            path: ['todos', 0, 'title']
          },
          completed: {
            path: ['todos', 0, 'completed']
          }
        },
        1: {
          path: ['todos', 1],
          title: {
            path: ['todos', 1, 'title']
          },
          completed: {
            path: ['todos', 1, 'completed']
          }
        }
      }
    });
  });
});
