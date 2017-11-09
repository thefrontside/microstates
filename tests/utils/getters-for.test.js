import 'jest';

import gettersFor from '../../src/utils/getters-for';

describe('gettersFor', () => {
  it('returns an object with only getters', () => {
    expect(
      gettersFor(
        class {
          get a() {
            return 'a';
          }
          get b() {
            return 'b';
          }
          method() {}
        }
      )
    ).toMatchObject({
      a: 'a',
      b: 'b',
    });
  });
  it('returns instance of Type', () => {
    class Type {}
    expect(gettersFor(Type)).toBeInstanceOf(Type);
  });
});
