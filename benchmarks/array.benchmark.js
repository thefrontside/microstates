import { Store, create } from '../index';
import benchmark from './benchmark';

const BIGARRAY = Array(100);
BIGARRAY.fill(0);

export default benchmark('Array', function(suite) {
  suite.add('create([])', () => {
    create([]);
  })
  suite.add('create([], Array(100))', () => {
    create([], BIGARRAY);
  })
  suite.add('create([]).set(Array(100))', () => {
    create([]).set(BIGARRAY);
  })
  suite.add('Store(create([]))', () => {
    Store(create([]));
  })
  suite.add('Store(create([], Array(100)))', () => {
    Store(create([], BIGARRAY));
  })
  suite.add('Store(create([]).set(Array(100)))', () => {
    Store(create([])).set(BIGARRAY);
  })
});
