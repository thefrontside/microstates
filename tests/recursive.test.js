import expect from 'expect';

import { Any } from '../src/types';
import { create } from '../src/microstates';
import { valueOf } from '../src/meta';

describe('recursive microstates', () => {

  class Cons {
    car = Any;
    cdr = Cons;
  }

  let cons;
  beforeEach(function() {
    cons = create(Cons, { car: 5});
  })

  it('doesnt blow up', function() {
    expect(cons).toBeDefined();
    expect(valueOf(cons.car)).toEqual(5);
  });

  it('can handle recursive things', function() {
    expect(cons.cdr.cdr.cdr).toBeDefined();
  });
})
