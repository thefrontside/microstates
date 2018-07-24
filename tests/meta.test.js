import expect from 'expect';

import { create, Any, Meta } from '../src/microstates';

describe("Meta", () => {

  it('is an error to try and get meta of null and undefined', () => {
    expect(() => Meta.get(null)).toThrow('cannot lookup ');
    expect(() => Meta.get()).toThrow('cannot lookup');
  })

  describe('updating metadata', function() {
    it('updates the object in an immutable way while preserving type', function() {
      class X {};
      let x = create(X);
      let meta = Meta.get(x);
      let updated = Meta.update(meta => ({path: meta.path.concat(['nest'])}), x);
      expect(updated).toBeInstanceOf(X);
      expect(updated).not.toBe(x);
    });
  });

});
