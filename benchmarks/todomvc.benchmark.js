import { Store, create } from '../index';
import benchmark from './benchmark';
import { TodoMVC } from '../tests/todomvc';


const MUCH_TODO = { todos: [] };
for (let i = 0; i < 100; i++) {
  MUCH_TODO.todos.push({
    title: 'Todo #{i}',
    completed: Math.random() > 0.5 ? true : false
  })
}
const ONE_MORE_TODO = { title: 'One more thing', completed: false };

export default benchmark('TodoMVC', function(suite) {
  suite.add('Store(create(TodoMVC, MUCH_TODO)); //100 todos', () => {
    Store(create(TodoMVC, MUCH_TODO));
  });
  let store = create(TodoMVC, MUCH_TODO);
  suite.add('store.todos.push(ONE_MORE_TODO); //add to a list of 100', () => {
    store.todos.push(ONE_MORE_TODO);
  })
});
