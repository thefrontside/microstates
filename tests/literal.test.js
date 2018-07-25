import expect from 'expect';
import literal from '../src/literal';

describe('Literal Syntax', function() {
  it('can create numbers', function() {
    expect(literal(5).increment().state).toEqual(6);
  });
  it('can create strings', function() {
    expect(literal('hello').concat(' goodbye').state).toEqual('hello goodbye');
  });
  it('can create booleans', function() {
    expect(literal(true).toggle().state).toEqual(false);
  });
  it('can create objects', function() {
    expect(literal({}).put('hello', 'world').state).toEqual({hello: 'world'});
  });
  it('can create arrays', function() {
    expect(literal([]).push('hello').push('world').state).toEqual(['hello', 'world']);
  });
  it('understands deeply nested objects and arrays', function() {
    let ms = literal({array: [5, { bool: true }], string: "hi", object: {object: {}}})
        .array[0].increment()
        .array[1].bool.toggle()
        .string.concat(" mom")
        .object.put('another', 'property')
        .object.object.put('deep', 'state');

    expect(ms.state).toEqual({
      array: [6, { bool: false }],
      string: "hi mom",
      object: {
        another: 'property',
        object: {
          deep: 'state'
        }
      }
    })
  });
});
