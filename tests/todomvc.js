import ArrayType from '../src/types/array';
import { create } from '../src/picostates';
import { filter } from '../src/query';

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
    return filter(this.todos, todo => todo.state.completed);
  }

  get active() {
    return filter(this.todos, todo => !todo.state.completed);
  }

  completeAll() {
    return this.todos.map(todo => todo.completed.set(true));
  }
}
