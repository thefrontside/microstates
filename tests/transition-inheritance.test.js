import 'jest';
import { map } from 'funcadelic';
import create from '../src';

class Confirmation {
  get isArmed() {
    return false;
  }
  get isConfirmed() {
    return false;
  }

  arm() {
    return this.set(Armed);
  }

  reset() {
    return this.set(Confirmation);
  }
}

class Armed extends Confirmation {
  get isArmed() {
    return false;
  }

  confirm() {
    return this.set(Confirmed);
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