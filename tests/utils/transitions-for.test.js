import 'jest';

import transitionsFor from '../../src/utils/transitions-for';

describe('transitionsFor', () => {
  describe('primitive', () => {
    let transitions = transitionsFor(Number);
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has increment transition', () => {
      expect(transitions.increment).toBeDefined();
    });
  });
  describe('composed', () => {
    let transitions = transitionsFor(
      class {
        action() {}
      }
    );
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has custom transition', () => {
      expect(transitions.action).toBeDefined();
    });
    it('has merge transition', () => {
      expect(transitions.merge).toBeDefined();
    });
  });
});
