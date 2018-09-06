import { create, filter } from '../index';

export class Todo {
  title = String;
  completed = create(Boolean, false);

  toggle() {
    return this.completed.set(!this.state.completed);
  }
}

export class Todos {
  static isArray = true
  __list__ = [Todo]

  someField = String

  get completed() {
    return filter(this, todo => todo.state.completed);
  }

  get active() {
    return filter(this, todo => !todo.state.completed);
  }
}

export class TodoMVC {
  todos = Todos;

  get completed() {
    return this.todos.completed
  }

  get active() {
    return this.todos.active
  }

  completeAll() {
    return this.todos.map(todo => todo.completed.set(true));
  }
}
