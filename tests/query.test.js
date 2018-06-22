import 'jest'
import { create, Tree, use } from 'microstates';

describe('reading', () => {
  class Person {
    age = Number;
    get _age() {
      return this.age;
    }
  }
  let homer;
  
  beforeEach(() => {
    homer = create(Person, { age: 42 });
  });

  it('has getter as microstate', () => {
    expect(homer._age.state).toBe(42);
  });

  describe('composed tree from query', () => {
    let tree, oTree;
    beforeEach(() => {
      tree = Tree.from(homer._age);
      oTree = Tree.from(homer.age);
    });
    it('has original tree in meta', () => {
      expect(tree.meta.origin).toBe(oTree);
    });
    it('trees dont have the same root', () => {
      expect(tree.root).not.toBe(oTree.root);
    })
  });

  describe('query on composed microstate', () => {
    class Person {
      age = Number;
      get older() {
        return this.age.increment().age;
      }
    }

    class Group {
      birthdayGirl = Person;
    }

    let p;
    beforeEach(() => {
      p = create(Group, { birthdayGirl: { age: 15 } } );
    });

    it('gives the incremented value in the query', () => {
      expect(p.birthdayGirl.older.state).toBe(16);
    });

    describe('increment again', () => {
      let result;
      beforeEach(() => {
        result = p.birthdayGirl.older.increment();
      });
      it('increments the result', () => {
        expect(result.valueOf()).toEqual({
          birthdayGirl: { age: 16 }
        })
      });
      it('changed the state of both', () => {
        expect(result.birthdayGirl.age.state).toBe(16);
        expect(result.birthdayGirl.older.state).toBe(17);
      });
    });
  });
  
  describe('middleware', () => {
    let withMiddleware;
    let callback;
    let middleware;
    let tree, oTree;
    beforeEach(() => {
      callback = jest.fn();
      middleware = next => (...args) => {
        callback(...args);
        return next(...args);
      }
      withMiddleware = use(middleware, homer);
      oTree = Tree.from(withMiddleware.age);
      tree = Tree.from(withMiddleware._age);
    });
    it('has middleware in root of oTree', () => {
      expect(oTree.root.data.middleware.includes(middleware)).toBe(true);
    });
    it('does not have middleware in root of tree', () => {
      expect(tree.root.data.middleware.includes(middleware)).toBe(false);
    });
    describe('invoked middleware', () => {
      describe('on original', () => {
        let result;
        beforeEach(() => {
          result = oTree.microstate.increment();
        });
        it('has correct result from original tree', () => {
          expect(result.valueOf()).toEqual({ age: 43 })
        });
        it('invoked the middleware', () => {
          expect(callback).toHaveBeenCalledTimes(1);
        });
      });
      describe('on derived', () => {
        let result;
        beforeEach(() => {
          result = tree.microstate.increment();
        });
        it('has correct result from original tree', () => {
          expect(result.valueOf()).toEqual({ age: 43 })
        });
        it('invoked the middleware', () => {
          expect(callback).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});

describe('returning primitive value', () => {
  class Person {
    firstName = String;
    lastName = String;
    get fullName() {
      return `${this.firstName.state} ${this.lastName.state}`;
    }
  }

  let homer;
  beforeEach(() => {
    homer = create(Person, { firstName: 'Homer', lastName: 'Simpson' });
  });
  it('allows state to be read off the getter value', () => {
    expect(homer.fullName.state).toBe('Homer Simpson');
  });
})

describe('todomvc', () => {
  class Todo {
    title = String;
    completed = Boolean;
  }
  class TodoMVC {
    todos = [Todo]
    filter = String;
    get filtered() {
      switch(this.filter.state) {
        case 'show_completed': return this.todos.filter(todo => todo.completed).todos;
        case 'show_active': return this.todos.filter(todo => !todo.completed).todos;
        default: return this.todos;
      }
    }
  }
  let todomvc;
  beforeEach(() => {
    todomvc = create(TodoMVC, {
      todos: [
        { title: 'Hello World', completed: false },
        { title: 'Greetings', completed: true },
        { title: 'Ola', completed: false }
      ]
    });
  });
  it('return all todos when filter is empty', () => {
    expect(todomvc.filtered).toHaveLength(3);
  });
  describe('filter=show_completed', () => {
    let showCompleted;
    beforeEach(() => {
      showCompleted = todomvc.filter.set('show_completed');
    });
    it('has stable filtered query result', () => {
      expect(showCompleted.filtered).toBe(showCompleted.filtered);
    });
    it('returns only completed item when show_completed', () => {
      expect(showCompleted.filtered).toHaveLength(1);
      expect(showCompleted.filtered[0].title.state).toBe('Greetings');
    });
    describe('filter=show_active', () => {
      let showActive;
      beforeEach(() => {
        showActive = todomvc.filter.set('show_active');
      });
      it('has correct value', () => {
        expect(showActive.valueOf()).toEqual({
          filter: "show_active",
          todos: [
            { title: 'Hello World', completed: false },
            { title: 'Greetings', completed: true },
            { title: 'Ola', completed: false }
          ]
        })
      });
      it('has filtered state in state object', () => {
        expect(showActive.state.filtered).toHaveLength(2);
        expect(showActive.state.filtered[0]).toBeInstanceOf(Todo)
        expect(showActive.state.filtered[1]).toBeInstanceOf(Todo)
      });
      it('returns only active items when show_active', () => {
        expect(showActive.filtered).toHaveLength(2);
        expect(showActive.filtered[0].title.state).toBe('Hello World');
        expect(showActive.filtered[1].title.state).toBe('Ola');
      });
      describe('toggle completed', () => {
        let oneCompleted;
        beforeEach(() => {
          oneCompleted = showActive.filtered[0].completed.toggle();
        });
        it('has correct value', () => {
          expect(oneCompleted.valueOf()).toEqual({
            filter: "show_active",
            todos: [
              { title: 'Hello World', completed: true },
              { title: 'Greetings', completed: true },
              { title: 'Ola', completed: false }
            ]
          })
        });
        it('has only one active item', () => {
          expect(oneCompleted.filtered).toHaveLength(1);
          expect(oneCompleted.filtered[0].title.state).toBe('Ola')
        });
        it('updates original tree', () => {
          expect(oneCompleted.todos[0].completed.state).toBe(true);
          expect(oneCompleted.todos[1].completed.state).toBe(true);
          expect(oneCompleted.todos[2].completed.state).toBe(false);
        });
      });
    });
  });
});

describe('validation', () => {
  it('throws an exception when query returns a microstate that has a tree without origin', () => {
    class List {
      numbers = [Number]
      get moreNumbers() {
        return this.numbers.push(5).numbers;
      }
    }

    let l = create(List, { numbers: [ 1, 2, 3, 4 ]});

    expect(() => {
      l.moreNumbers[4].increment();
    }).toThrowError(/Could not find an microstate at \[numbers.4\]. You might have tried to modify a microstate that does not exist in original microstate./)
  })
});