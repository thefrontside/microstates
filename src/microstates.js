import { map, append } from 'funcadelic';

import Microstate from './utils/microstate';

export default function Microstates(Type, value) {
  let { transitions, states } = Microstate(Type, value);

  return append(
    {
      Type,
      value,

      get states() {
        return states.collapsed;
      },

      get transitions() {
        return transitions.collapsed;
      },

      valueOf() {
        return value;
      },

      isMicrostate: true,
    },
    map(
      transitions => map(t => (...args) => Microstates(Type, t(...args)), transitions),
      transitions
    ).collapsed
  );
}
