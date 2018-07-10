import ArrayType from '../src/types/array';
import { create } from '../src/picostates';
import { filter } from 'funcadelic';

export class StringType {}
export class BooleanType {}

export class Todo {
  title = create(StringType);
  completed = create(BooleanType, false);

  toggle() {
    return this.completed.set(!this.state.completed);
  }
}

export class TodoMVC {
  todos = create(ArrayType.of(Todo));

  get completed() {
    return filter(todo => todo.state.completed, this.todos);
  }

  get active() {
    return filter(todo => !todo.state.completed, this.todos);
  }

  completeAll() {
    return this.todos.map(todo => todo.completed.set(true));
  }
}
