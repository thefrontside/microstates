import { Store, create } from '../index';
import benchmark from './benchmark';

const BIGOBJECT = {};
for (let i = 0; i < 100; i++) {
  BIGOBJECT[`key-${i}`] = `value-${i}`;
}


export default benchmark('Object', function(suite) {
  suite.add('create({})', () => {
    create({});
  });
  suite.add('create({}).set({})', () => {
    create({}).set({});
  });
  suite.add('create({}, BIGOBJECT)', () => {
    create({}, BIGOBJECT);
  });
  suite.add('create({}).set(BIGOBJECT)', () => {
    create({}).set(BIGOBJECT);
  });
  suite.add('Store(create({}))', () => {
    Store(create({}));
  });
  suite.add('Store(create({}, BIGOBJECT))', () => {
    Store(create({}, BIGOBJECT));
  });
  suite.add('Store(create({}).set(BIGOBJECT))', () => {
    Store(create({})).set(BIGOBJECT);
  });
});
