import { create, filter } from '../index';

export class Todo {
  title = String;
  completed = create(Boolean, false);

  toggle() {
    return this.completed.set(!this.completed.state);
  }
}

export class TodoMVC {
  todos = [Todo];

  get completed() {
    return filter(this.todos, todo => todo.completed.state);
  }

  get active() {
    return filter(this.todos, todo => !todo.completed.state);
  }

  initialize(value) {
    if (value.valueOf() == null) {
      return {};
    } else {
      return this;
    }
  }

  completeAll() {
    return this.todos.map(todo => todo.completed.set(true));
  }
}
