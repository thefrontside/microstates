import 'jest';
import { map } from 'funcadelic';
import create, * as MS from '../src';

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

let dnd = create(Confirmation);
let armed, confirmed, reset, rearmed, state;
beforeEach(() => {
  armed = dnd.arm();
  confirmed = armed.confirm();
  reset = confirmed.reset();
  rearmed = reset.arm();
  state = rearmed.state;
});

it('can transition to inherited transition', () => {
  expect(
    state
  ).toBeInstanceOf(Armed);
});