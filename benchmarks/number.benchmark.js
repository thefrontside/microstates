import { Store, create } from '../index';
import benchmark from './benchmark';

export default benchmark('Number', function(suite) {
  suite.add('create(Number)', () => {
    create(Number);
  });
  suite.add('create(Number, 42)', () => {
    create(Number, 42);
  });
  suite.add('create(Number).set(42)', () => {
    create(Number).set(42);
  });
  suite.add('Store(create(Number))', () => {
    Store(create(Number));
  });
  suite.add('Store(create(Number, 42))', () => {
    Store(create(Number, 42));
  });

  suite.add('Store(create(Number)).set(42)', () => {
    Store(create(Number)).set(42);
  });
});
