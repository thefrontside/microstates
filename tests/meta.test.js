import { expect } from 'chai';

import { Any, Meta } from '../src/picostates';

describe("Meta", () => {

  it('is an error to try and get meta of null and undefined', () => {
    expect(() => Meta.get(null)).to.throw('retrieve metadata');
    expect(() => Meta.get()).to.throw('retrieve metadata');
  })
  it('is an error to try and get meta of a non microstate', () => {
    expect(() => Meta.get(1)).to.throw('retrieve metadata');
    expect(() => Meta.get('hello')).to.throw('retrieve metadata');
    expect(() => Meta.get({})).to.throw('retrieve metadata');
    expect(() => Meta.get([])).to.throw('retrieve metadata');
    expect(() => Meta.get(class {})).to.throw('retrieve metadata');
  })

  describe('updating metadata', function() {
    it('updates the object in an immutable way while preserving type', function() {
      class X extends Any {};
      let x = new X();
      let meta = Meta.get(x);
      let updated = Meta.map(meta => ({path: meta.path.concat(['nest'])}), x);
      expect(updated).to.be.instanceof(X);
      expect(updated).not.to.equal(x);
    });
  });

});

// function contextualize(key, value, context) {
//   return Meta.map(meta => ({
//     context: context,
//     path: append(key, meta.path),
//     lens: compose(Prop('key'), meta.lens)
//   }), value);
// }
