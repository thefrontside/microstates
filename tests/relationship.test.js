/* global describe, it, beforeEach */

import expect from 'expect';

import { Any } from '../src/types';
import { relationship, Edge } from '../src/relationship';

describe('relationships', () => {
  let rel;
  let e = (value) => new Edge(value, []);

  describe('with absolutely nothing specified', () => {
    beforeEach(() => {
      rel = relationship(10);
    });

    it('reifies to using Any for the type and the passed value, }', () => {
      expect(rel.traverse(e(5))).toEqual({ Type: Any, value: 5 });
    });

    it('uses the supplied value if non is given', () => {
      expect(rel.traverse(e())).toEqual({ Type: Any, value: 10 });
    });
  });

  describe('depending on the parent microstate that they are a part of', () => {
    beforeEach(() => {
      rel = relationship((value, parent) => {
        if (typeof parent === 'number') {
          return { Type: Number, value: Number(value) };
        } else if (typeof parent === 'string') {
          return { Type: String, value: String(value) };
        } else {
          return { Type: Object, value: Object(value) };
        }
      });
    });
    it('generates numbers when the parent is a number', () => {
      expect(rel.traverse(5, 'parent')).toEqual({ Type: String, value: '5'});
    });

    it('generates strings when the parent is a string', () => {
      expect(rel.traverse(5, 0)).toEqual({ Type: Number, value: 5});
    });
  });

  describe('that are mapped', () => {
    beforeEach(() => {
      rel = relationship()
        .map(({ value }) => ({Type: Number, value: value * 2 }));
    });

    it('executes the mapping as part of the traversal', () => {
      expect(rel.traverse(e(3))).toEqual({Type: Number, value: 6});
    });
  });

  describe('Edges', () => {
    let edge;
    beforeEach(() => {
      edge = new Edge({one: {two: 2}}, ['one', 'two']);
    });
    it('knows its value', () => {
      expect(edge.value).toEqual(2);
    });
    it('knows its parent value', () => {
      expect(edge.parentValue).toEqual({one: {two: 2}});
    });
    it('has a name provided it is not anonymous', () => {
      expect(edge.name).toEqual('two');
    });
  });
});
