import 'jest';
import { create } from 'microstates';

class Confirmation {
  get isArmed() {
    return false;
  }
  get isConfirmed() {
    return false;
  }

  arm() {
    return create(Armed);
  }

  reset() {
    return create(Confirmation);
  }
}

class Armed extends Confirmation {
  get isArmed() {
    return false;
  }

  confirm() {
    return create(Confirmed);
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