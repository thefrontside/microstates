import 'jest';

import transitionsFor from '../../src/utils/transitions-for';

describe('transitionsFor', () => {
  describe('number', () => {
    let transitions = transitionsFor(Number);
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has number transitions', () => {
      expect(transitions.sum).toBeDefined();
      expect(transitions.subtract).toBeDefined();
      expect(transitions.increment).toBeDefined();
      expect(transitions.decrement).toBeDefined();
    });
  });
  describe('string', () => {
    let transitions = transitionsFor(String);
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has string transitions', () => {
      expect(transitions.concat).toBeDefined();
    });
  });
  describe('boolean', () => {
    let transitions = transitionsFor(Boolean);
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has toggle transition', () => {
      expect(transitions.toggle).toBeDefined();
    });
  });
  describe('object', () => {
    let transitions = transitionsFor(Object);
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has assign transition', () => {
      expect(transitions.assign).toBeDefined();
    });
  });
  describe('array', () => {
    let transitions = transitionsFor(Array);
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has push transition', () => {
      expect(transitions.push).toBeDefined();
    });
  });
  describe('composed', () => {
    let transitions = transitionsFor(
      class {
        static action() {}
      }
    );
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has custom transition', () => {
      expect(transitions.action).toBeDefined();
    });
  });
});
