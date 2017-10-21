import 'jest';

import transitionsFor from '../../src/utils/transitions-for';

describe('transitionsFor', () => {
  describe('Array', () => {
    let transitions = transitionsFor(Array);
    it('has transitions', () => {
      expect(transitions).toMatchObject({
        set: expect.any(Function),
        push: expect.any(Function),
      });
    });
    it('does not have initialize', () => {
      expect(transitions.initialize).not.toBeDefined();
    });
  });
  describe('String', () => {
    let transitions = transitionsFor(String);
    it('has transitions', () => {
      expect(transitions).toMatchObject({
        set: expect.any(Function),
        concat: expect.any(Function),
      });
    });
    it('does not have initialize', () => {
      expect(transitions.initialize).not.toBeDefined();
    });
  });
  describe('Number', () => {
    let transitions = transitionsFor(Number);
    it('has transitions', () => {
      expect(transitions).toMatchObject({
        set: expect.any(Function),
        increment: expect.any(Function),
      });
    });
    it('does not have initialize', () => {
      expect(transitions.initialize).not.toBeDefined();
    });
  });
  describe('Boolean', () => {
    let transitions = transitionsFor(Boolean);
    it('has transitions', () => {
      expect(transitions).toMatchObject({
        set: expect.any(Function),
        toggle: expect.any(Function),
      });
    });
    it('does not have initialize', () => {
      expect(transitions.initialize).not.toBeDefined();
    });
  });
  describe('Object', () => {
    let transitions = transitionsFor(Object);
    it('has transitions', () => {
      expect(transitions).toMatchObject({
        set: expect.any(Function),
        assign: expect.any(Function),
      });
    });
    it('does not have initialize', () => {
      expect(transitions.initialize).not.toBeDefined();
    });
  });
  describe('Custom Class', () => {
    let transitions = transitionsFor(
      class {
        action() {}
      }
    );
    it('has transitions', () => {
      expect(transitions).toMatchObject({
        set: expect.any(Function),
        merge: expect.any(Function),
      });
    });
    it('does not have initialize', () => {
      expect(transitions.initialize).not.toBeDefined();
    });
    it('has custom transition', () => {
      expect(transitions.action).toBeDefined();
    });
  });
});
