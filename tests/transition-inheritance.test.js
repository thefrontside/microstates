import 'jest';
import { map } from 'funcadelic';
import microstate, * as MS from '../src';

class Confirmation {
  get isArmed() {
    return false;
  }
  get isConfirmed() {
    return false;
  }

  arm() {
    return this(Armed);
  }

  reset() {
    return this(Confirmation);
  }
}

class Armed extends Confirmation {
  get isArmed() {
    return false;
  }

  confirm() {
    return this(Confirmed);
  }
}

class Confirmed extends Confirmation {
  get isConfirmed() {
    return true;
  }
}

let dnd = microstate(Confirmation);

it('can transition to inherited transition', () => {
  expect(
    dnd
      .arm()
      .confirm()
      .reset()
      .arm().state
  ).toBeInstanceOf(Armed);
});