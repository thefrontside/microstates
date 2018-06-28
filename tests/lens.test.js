import { expect } from 'chai';
import { compose, view, over, set, Prop, Path, transparent, Lens, Substate } from '../src/lens';
import { append } from 'funcadelic';

describe('lenses', () => {
  it('get object lens', () => {
    expect(view(Prop('hello'), {hello: 'World'})).to.equal('World');
  })

  it('over an object lens', () => {
    expect(over(Prop('hello'), v => `${v}!`, {hello: 'World'})).to.deep.equal({hello: 'World!'});
  })
  it('set an object lens', () => {
    expect(set(Prop('hello'), 'Planet!', {hello: 'World'})).to.deep.equal({hello: 'Planet!'});
  })

  it('composing lenses', () => {
    var start = {message: {hello: 'World'}};

    let lens = compose(Prop('message'), Prop('hello'));
    expect(view(lens, start)).to.equal('World');
    // t.deepEqual({message: {hello: 'Planet'}}, set(lens, 'Planet', start))
  })
})

describe('state lenses', function() {
  it('sets the state', function() {
    let object = { b: { state: 'the state '}};
    let lens = Substate('b');
    let state = view(lens, object);
    var newb = { state: 'new state' };
    let next = set(lens, newb, object);
    expect(next.state.b).to.equal(next.b.state)
  });
});



// test('transparent lens', t => {
//   t.is(5, view(compose(transparent, transparent), 5));
//   t.is(10, set(transparent, 10, 5));
//   t.is(5, view(compose(Prop('five'), transparent), {five: 5}))
//   t.deepEqual({five: 'faiv'}, set(compose(transparent, Prop('five')), 'faiv', {five: 5}))
//   t.deepEqual({five: 'faiv'}, set(compose(Prop('five'), transparent), 'faiv', {five: 5}))
// })

// test('lens path', t => {
//   let lens = lensPath(['message', 'hello']);
//   t.is('World', view(lens, { message: { hello: 'World' } }));
//   t.deepEqual({message: { hello: 'Planet'}}, set(lens, 'Planet', {message: {hello: 'World'}}))
// })

// test('punch out lenses', t => {
//   let xyzw = lensPath(['x', 'y', 'z', 'w'])
//   t.is(undefined, view(xyzw, undefined))
//   t.deepEqual({x: {y: {z: {w: 10}}}}, set(xyzw, 10, undefined))
// })
