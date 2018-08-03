import { create, filter } from '../index';

export class Todo {
  title = String;
  completed = create(Boolean, false);

  toggle() {
    return this.completed.set(!this.state.completed);
  }
}

export class TodoMVC {
  todos = [Todo];

  get completed() {
    return filter(this.todos, todo => todo.state.completed);
  }

  get active() {
    return filter(this.todos, todo => !todo.state.completed);
  }

  completeAll() {
    return this.todos.map(todo => todo.completed.set(true));
  }
}
