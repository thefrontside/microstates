import { create } from "microstates";

const SHOW_ALL = "";
const SHOW_COMPLETED = "show_completed";
const SHOW_ACTIVE = "show_active";

const FILTER_OPTIONS = {
  [SHOW_ALL]: "All",
  [SHOW_ACTIVE]: "Active",
  [SHOW_COMPLETED]: "Completed"
};

class TodoMVC {
  todos = [Todo];
  newTodo = String;
  filter = String;

  get nextId() {
    return (
      this.todos.reduce(
        (max, todo) => max.set(Math.max(todo.id.state, max.state)),
        0
      ).todos.state + 1
    );
  }

  get completed() {
    return this.todos.filter(({ completed }) => completed.state).todos;
  }

  get active() {
    return this.todos.filter(({ completed }) => !completed.state).todos;
  }

  get completedCount() {
    return this.completed.length;
  }

  get remainingCount() {
    return this.todos.length - this.completedCount.state;
  }

  get isAllComplete() {
    return this.todos.length > 0 && this.remainingCount.state === 0;
  }

  get hasTodos() {
    return this.todos.length > 0;
  }

  get filteredTodos() {
    switch (this.filter.state) {
      case SHOW_COMPLETED:
        return this.completed;
      case SHOW_ACTIVE:
        return this.active;
      case SHOW_ALL:
      default:
        return this.todos;
    }
  }

  insertNewTodo() {
    if (this.newTodo.state.length === 0) {
      return this;
    } else {
      return this.todos
        .push({
          text: this.newTodo.state,
          id: this.nextId.state,
          completed: false
        })
        .newTodo.set("");
    }
  }

  clearCompleted() {
    return this.todos.filter(({ completed }) => !completed.state);
  }

  toggleAll() {
    return this.todos.map(todo => todo.completed.set(true));
  }
}

class Todo {
  id = Number;
  text = String;
  completed = Boolean;

  edit() {
    return create(EditingTodo, this);
  }
}

class EditingTodo extends Todo {
  get editing() {
    return true;
  }

  save() {
    return create(Todo, this);
  }
}

let todomvc = create(TodoMVC, {
  todos: [{ id: 0, text: "Write Microstates Docs", completed: false }]
});