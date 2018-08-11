import { create, Store } from '../index';
import benchmark from './benchmark';

export default benchmark('Any', function AnyBenchmarks(suite) {
  suite.add('create(Any)', () => {
    create();
  });
  suite.add('create(Any, 5)', () => {
    create(undefined, 5);
  });
  suite.add('create(Any).set(5)', () => {
    create().set(5);
  })
  suite.add('Store(create(Any))', () => {
    Store(create());
  });
  suite.add('Store(create(Any, 5))', () => {
    Store(create(undefined, 5));
  });
  suite.add('Store(create().set(5))', () => {
    Store(create().set(5));
  })
});
