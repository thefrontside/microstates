import test from 'ava';

import { compose, view, over, set, lensKey, lensPath, transparent } from '../src/lens';

test('get object lens', t => {
  t.is('World', view(lensKey('hello'), {hello: 'World'}))
})

test('over an object lens', t => {
  t.deepEqual({hello: 'World!'}, over(lensKey('hello'), v => `${v}!`, {hello: 'World'}))
})

test('set an object lens', t => {
  t.deepEqual({hello: 'Planet!'}, set(lensKey('hello'), 'Planet!', {hello: 'World'}))
})

test('composing lenses', t => {
  var start = {message: {hello: 'World'}};

  let lens = compose(lensKey('message'), lensKey('hello'));
  t.is('World', view(lens, start));
  t.deepEqual({message: {hello: 'Planet'}}, set(lens, 'Planet', start))
})

test('transparent lens', t => {
  t.is(5, view(compose(transparent, transparent), 5));
  t.is(10, set(transparent, 10, 5));
  t.is(5, view(compose(lensKey('five'), transparent), {five: 5}))
  t.deepEqual({five: 'faiv'}, set(compose(transparent, lensKey('five')), 'faiv', {five: 5}))
  t.deepEqual({five: 'faiv'}, set(compose(lensKey('five'), transparent), 'faiv', {five: 5}))
})

test('lens path', t => {
  let lens = lensPath(['message', 'hello']);
  t.is('World', view(lens, { message: { hello: 'World' } }));
  t.deepEqual({message: { hello: 'Planet'}}, set(lens, 'Planet', {message: {hello: 'World'}}))
})

test('punch out lenses', t => {
  let xyzw = lensPath(['x', 'y', 'z', 'w'])
  t.is(undefined, view(xyzw, undefined))
  t.deepEqual({x: {y: {z: {w: 10}}}}, set(xyzw, 10, undefined))
})
