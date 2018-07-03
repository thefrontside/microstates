import { expect } from 'chai';

import { create, Any, Meta } from '../src/picostates';

describe("Meta", () => {

  it('is an error to try and get meta of null and undefined', () => {
    expect(() => Meta.get(null)).to.throw('cannot lookup ');
    expect(() => Meta.get()).to.throw('cannot lookup');
  })

  describe('updating metadata', function() {
    it('updates the object in an immutable way while preserving type', function() {
      class X {};
      let x = create(X);
      let meta = Meta.get(x);
      let updated = Meta.map(meta => ({path: meta.path.concat(['nest'])}), x);
      expect(updated).to.be.instanceof(X);
      expect(updated).not.to.equal(x);
    });
  });

});
